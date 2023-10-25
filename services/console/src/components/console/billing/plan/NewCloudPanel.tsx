import type { Params } from "astro";
import bencher_valid_init, { type InitOutput } from "bencher_valid";
import BillingHeader from "../BillingHeader";
import {
	createResource,
	type Accessor,
	createMemo,
	Show,
	type Resource,
	createSignal,
	Switch,
	Match,
} from "solid-js";
import type { BillingPanelConfig } from "../BillingPanel";
import { authUser } from "../../../../util/auth";
import { validJwt } from "../../../../util/valid";
import { httpGet, httpPatch } from "../../../../util/http";
import { UsageKind, type JsonUsage, type Jwt } from "../../../../types/bencher";
import { NotifyKind, pageNotify } from "../../../../util/notify";
import Field from "../../../field/Field";
import FieldKind from "../../../field/kind";
import { fmtDate, planLevel, suggestedMetrics } from "../../../../util/convert";
import BillingForm from "./BillingForm";

interface Props {
	apiUrl: string;
	params: Params;
	config: Accessor<BillingPanelConfig>;
}

const CloudPanel = (props: Props) => {
	const [bencher_valid] = createResource(
		async () => await bencher_valid_init(),
	);
	const user = authUser();

	const fetcher = createMemo(() => {
		return {
			params: props.params,
			bencher_valid: bencher_valid(),
			token: user?.token,
		};
	});
	const fetchPlan = async (fetcher: {
		params: Params;
		bencher_valid: InitOutput;
		token: string;
	}) => {
		if (!fetcher.bencher_valid) {
			return null;
		}
		if (!validJwt(fetcher.token)) {
			return null;
		}
		const path = `/v0/organizations/${fetcher.params.organization}/usage`;
		return await httpGet(props.apiUrl, path, fetcher.token)
			.then((resp) => {
				console.log(resp.data);
				return resp?.data;
			})
			.catch((error) => {
				console.log(error);
				return null;
			});
	};
	const [usage, { refetch }] = createResource<null | JsonUsage>(
		fetcher,
		fetchPlan,
	);

	return (
		<>
			<BillingHeader config={props.config()?.header} />
			<section class="section">
				<div class="container">
					<div class="columns">
						<div class="column">
							<Switch>
								<Match when={usage()?.kind === UsageKind.CloudFree}>
									<BillingForm
										apiUrl={props.apiUrl}
										params={props.params}
										bencher_valid={bencher_valid}
										user={user}
										usage={usage}
										handleRefresh={refetch}
									/>
								</Match>
								<Match
									when={usage()?.kind === UsageKind.SelfHostedLicensedCloud}
								>
									<SelfHostedLicensedPanel usage={usage} />
								</Match>
							</Switch>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

const SelfHostedLicensedPanel = (props: {
	usage: Resource<null | JsonUsage>;
}) => {
	return (
		<div class="content">
			<h2 class="title">
				{planLevel(props.usage()?.license?.level)} Tier (Self-Hosted License)
			</h2>
			<h3 class="subtitle">
				{fmtDate(props.usage()?.start_time)} -{" "}
				{fmtDate(props.usage()?.end_time)}
			</h3>
			<h4>
				Entitlements:{" "}
				{props.usage()?.license?.entitlements?.toLocaleString() ?? 0}
			</h4>
			<h4>
				Self-Hosted Organization UUID:{" "}
				<code style="overflow-wrap:anywhere;">
					{props.usage()?.license?.organization}
				</code>
			</h4>
			<h4>Self-Hosted License Key:</h4>
			<code style="overflow-wrap:anywhere;">
				<a
					title="Copy to clipboard"
					onClick={(_) =>
						navigator.clipboard.writeText(props.usage()?.license?.key ?? "")
					}
				>
					{props.usage()?.license?.key}
				</a>
			</code>
			<h2 class="title">
				What to do with your Bencher Plus Self-Hosted License
			</h2>
			<h4>
				<ol>
					<li>
						<a
							title="Copy to clipboard"
							onClick={(_) =>
								navigator.clipboard.writeText(props.usage()?.license?.key ?? "")
							}
						>
							Click here to copy your Self-Hosted license key
						</a>
					</li>
					<li>
						Navigate to this same page on your Bencher Self-Hosted account,
						Organization Billing
					</li>
					<li>Enter your license key in the "Self-Hosted License" box</li>
					<li>
						🎉 Lettuce turnip the beet! You now have a Bencher Plus Self-Hosted
						License!
					</li>
				</ol>
			</h4>
		</div>
	);
};

export default CloudPanel;