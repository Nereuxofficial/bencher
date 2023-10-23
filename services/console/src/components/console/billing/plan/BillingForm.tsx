import type { InitOutput } from "bencher_valid";
import {
	For,
	Resource,
	Show,
	createEffect,
	createMemo,
	createSignal,
	type Accessor,
	type Setter,
} from "solid-js";
import { JsonAuthUser, PlanLevel } from "../../../../types/bencher";
import { useSearchParams } from "../../../../util/url";
import { validPlanLevel, validUuid } from "../../../../util/valid";
import { PLAN_PARAM } from "../../../auth/auth";
import Pricing from "./Pricing";
import PaymentCard from "./PaymentCard";
import type { Params } from "astro";
import Field from "../../../field/Field";
import FieldKind from "../../../field/kind";

interface Props {
	apiUrl: string;
	params: Params;
	bencher_valid: Resource<InitOutput>;
	user: JsonAuthUser;
	handleRefresh: () => void;
}

enum PlanKind {
	Metered,
	Licensed,
	SelfHosted,
}

const BillingForm = (props: Props) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const setPlanLevel = (planLevel: PlanLevel) => {
		setSearchParams({ [PLAN_PARAM]: planLevel });
	};
	const plan = createMemo(() => searchParams[PLAN_PARAM] as PlanLevel);

	const [planKind, setPlanKind] = createSignal(PlanKind.Metered);
	const [entitlements, setEntitlements] = createSignal<number>(5);
	const entitlementsMonthly = createMemo(() => entitlements() * 1_000);
	const entitlementsMonthlyCost = createMemo(() => {
		switch (plan()) {
			case PlanLevel.Team:
				return entitlementsMonthly() * 0.1;
			case PlanLevel.Enterprise:
				return entitlementsMonthly() * 0.5;
			default:
				return 0.0;
		}
	});
	const entitlementsAnnually = createMemo(() => {
		switch (plan()) {
			case PlanLevel.Team:
			case PlanLevel.Enterprise:
				return entitlementsMonthly() * 12;
			default:
				return null;
		}
	});
	const entitlementsAnnualCost = createMemo(
		() => entitlementsMonthlyCost() * 12,
	);
	const [organizationUuid, setOrganizationUuid] = createSignal("");
	const organizationUuidValid = createMemo(() => {
		switch (planKind()) {
			case PlanKind.SelfHosted:
				if (organizationUuid()) {
					return validUuid(organizationUuid());
				} else {
					return null;
				}
			default:
				return true;
		}
	});

	createEffect(() => {
		if (!props.bencher_valid()) {
			return;
		}
		if (!validPlanLevel(searchParams[PLAN_PARAM])) {
			setPlanLevel(PlanLevel.Free);
		}
	});

	return (
		<div class="columns is-centered">
			<div class="column">
				<Pricing
					plan={plan()}
					freeText="Stick with Free"
					handleFree={() => setPlanLevel(PlanLevel.Free)}
					teamText="Go with Team"
					handleTeam={() => setPlanLevel(PlanLevel.Team)}
					enterpriseText="Go with Enterprise"
					handleEnterprise={() => setPlanLevel(PlanLevel.Enterprise)}
				/>
				<Show when={plan() !== PlanLevel.Free}>
					<br />
					<br />
					<PlanLocality
						plan={plan}
						planKind={planKind}
						handlePlanKind={setPlanKind}
						entitlements={entitlements}
						handleEntitlements={setEntitlements}
						entitlementsMonthly={entitlementsMonthly}
						entitlementsAnnualCost={entitlementsAnnualCost}
						organizationUuid={organizationUuid}
						handleOrganizationUuid={setOrganizationUuid}
						organizationUuidValid={organizationUuidValid}
					/>
					<PaymentCard
						apiUrl={props.apiUrl}
						params={props.params}
						bencher_valid={props.bencher_valid}
						user={props.user}
						path={`/v0/organizations/${props.params.organization}/plan`}
						plan={plan}
						entitlements={entitlementsAnnually}
						organizationUuid={organizationUuid}
						organizationUuidValid={organizationUuidValid}
						handleRefresh={props.handleRefresh}
					/>
				</Show>
			</div>
		</div>
	);
};

const PlanLocality = (props: {
	plan: Accessor<PlanLevel>;
	planKind: Accessor<PlanKind>;
	handlePlanKind: Setter<PlanKind>;
	entitlements: Accessor<number>;
	handleEntitlements: Setter<number>;
	entitlementsMonthly: Accessor<number>;
	entitlementsAnnualCost: Accessor<number>;
	organizationUuid: Accessor<string>;
	handleOrganizationUuid: Setter<string>;
	organizationUuidValid: Accessor<null | boolean>;
}) => {
	return (
		<div class="columns is-centered">
			<div class="column">
				<div class="buttons has-addons is-centered">
					<For
						each={[
							["Monthly Metered", PlanKind.Metered],
							["Annual License", PlanKind.Licensed],
							["Self-Hosted License", PlanKind.SelfHosted],
						]}
					>
						{([name, kind]) => (
							<button
								class={`button ${
									props.planKind() === kind && "is-primary is-selected"
								}`}
								onClick={(_e) => props.handlePlanKind(kind as PlanKind)}
							>
								{name}
							</button>
						)}
					</For>
				</div>
				<Show when={props.planKind() !== PlanKind.Metered}>
					<div class="content has-text-centered">
						<p>
							Monthly Metrics: {props.entitlementsMonthly().toLocaleString()}
						</p>
						<p>
							License Cost: ${props.entitlementsAnnualCost().toLocaleString()}
							/year
						</p>
						<input
							class="slider"
							type="range"
							min="1"
							max="25"
							value={props.entitlements()}
							style="width: 25em"
							onChange={(_e) => {
								props.handleEntitlements(Number(_e.currentTarget.value));
							}}
						></input>
					</div>
				</Show>
				<Show when={props.planKind() === PlanKind.SelfHosted}>
					<div class="columns is-centered">
						<div class="column is-half">
							<Field
								kind={FieldKind.INPUT}
								fieldKey="organization-uuid"
								label="Self-Hosted Organization UUID"
								value={props.organizationUuid()}
								valid={props.organizationUuidValid()}
								config={{
									label: "UUID",
									type: "text",
									placeholder: "00000000-0000-0000-0000-000000000000",
									icon: "fas fa-laptop-house",
									help: "Must be a valid UUID",
									validate: validUuid,
								}}
								handleField={(_key, value, _valid) => {
									props.handleOrganizationUuid(value as string);
								}}
							/>
						</div>
					</div>
				</Show>
			</div>
		</div>
	);
};

export default BillingForm;