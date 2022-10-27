import projectFieldsConfig from "../../fields/config/org/projectFieldsConfig";
import thresholdFieldsConfig from "../../fields/config/org/thresholdFieldsConfig";
import { Button, Card, Display, Field, Operation, Row } from "./types";
import { BENCHER_API_URL, parentPath, addPath, viewUuidPath } from "./util";

const thresholdsConfig = {
  [Operation.LIST]: {
    operation: Operation.LIST,
    header: {
      title: "Thresholds",
      buttons: [
        {
          kind: Button.ADD,
          path: addPath,
        },
        { kind: Button.REFRESH },
      ],
    },
    table: {
      url: (path_params) => `${BENCHER_API_URL}/v0/projects/${path_params?.project_slug}/thresholds`,
      add: {
        path: addPath,
        text: "Add a Threshold",
      },
      row: {
        key: "uuid",
        items: [{}, {}, {}, {}],
        button: {
          text: "View",
          path: (pathname, datum) => viewUuidPath(pathname, datum),
        },
      },
    },
  },
  [Operation.ADD]: {
    operation: Operation.ADD,
    header: {
      title: "Add Threshold",
      path: parentPath,
    },
    form: {
      url: (path_params) => `${BENCHER_API_URL}/v0/projects/${path_params?.project_slug}/thresholds`,
      fields: [
        {
          kind: Field.HIDDEN,
          key: "project",
          path_param: "project_slug",
        },
        {
          kind: Field.INPUT,
          label: "Branch",
          key: "branch",
          value: "",
          valid: null,
          validate: true,
          nullify: false,
          clear: false,
          config: thresholdFieldsConfig.name,
        },
        {
          kind: Field.INPUT,
          label: "Testbed",
          key: "testbed",
          value: "",
          valid: null,
          validate: true,
          nullify: false,
          clear: false,
          config: thresholdFieldsConfig.name,
        },
        {
          kind: Field.INPUT,
          label: "TODO",
          key: "kind",
          value: "",
          valid: null,
          validate: true,
          nullify: false,
          clear: false,
          config: thresholdFieldsConfig.name,
        },
      ],
      path: parentPath,
    },
  },
  [Operation.VIEW]: {
    operation: Operation.VIEW,
    header: {
      key: "uuid",
      path: parentPath,
    },
    deck: {
      url: (path_params) => `${BENCHER_API_URL}/v0/projects/${path_params?.project_slug}/thresholds/${path_params?.threshold_uuid}`,
      cards: [
        {
          kind: Card.FIELD,
          label: "Branch UUID",
          key: "branch",
          display: Display.RAW,
        },
        {
          kind: Card.FIELD,
          label: "Testbed UUID",
          key: "testbed",
          display: Display.RAW,
        },
      ],
      buttons: false,
    },
  },
};

export default thresholdsConfig;
