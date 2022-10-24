import projectFieldsConfig from "../../fields/config/org/projectFieldsConfig";
import { Button, Card, Field, Operation, PerfTab, Row } from "./types";
import { BENCHER_API_URL, parentPath, addPath, viewSlugPath } from "./util";

const projectsConfig = {
  [Operation.LIST]: {
    operation: Operation.LIST,
    header: {
      title: "Projects",
      buttons: [
        {
          kind: Button.ADD,
          path: (pathname) => {
            return addPath(pathname);
          },
        },
        { kind: Button.REFRESH },
      ],
    },
    table: {
      url: (path_params) => {
        return `${BENCHER_API_URL}/v0/organizations/${path_params?.organization_slug}/projects`;
      },
      add: {
        path: (pathname) => {
          return addPath(pathname);
        },
        text: "Add a Project",
      },
      row: {
        key: "name",
        items: [
          {
            kind: Row.TEXT,
            key: "slug",
          },
          {},
          {
            kind: Row.BOOL,
            key: "owner_default",
            text: "Default",
          },
          {},
        ],
        button: {
          text: "Select",
          path: (_pathname, datum) => {
            return `/console/projects/${datum?.slug}/perf`;
          },
        },
      },
    },
  },
  [Operation.ADD]: {
    operation: Operation.ADD,
    header: {
      title: "Add Project",
      path: (pathname) => {
        return parentPath(pathname);
      },
    },
    form: {
      url: `${BENCHER_API_URL}/v0/projects`,
      fields: [
        {
          kind: Field.INPUT,
          label: "Name",
          key: "name",
          value: "",
          valid: null,
          validate: true,
          nullify: false,
          clear: false,
          config: projectFieldsConfig.name,
        },
        {
          kind: Field.TEXTAREA,
          label: "Description",
          key: "description",
          value: "",
          valid: null,
          validate: false,
          nullify: true,
          clear: false,
          config: projectFieldsConfig.description,
        },
        {
          kind: Field.INPUT,
          label: "URL",
          key: "url",
          value: "",
          valid: null,
          validate: false,
          nullify: true,
          clear: false,
          config: projectFieldsConfig.url,
        },
        {
          kind: Field.SWITCH,
          label: "Public Perf Page",
          key: "public",
          type: "switch",
          value: false,
          validate: false,
          nullify: false,
          clear: false,
          config: projectFieldsConfig.public,
        },
      ],
      path: (pathname) => {
        return parentPath(pathname);
      },
    },
  },
  [Operation.VIEW]: {
    operation: Operation.VIEW,
    header: {
      key: "name",
      path: (pathname) => {
        return parentPath(pathname);
      },
    },
    deck: {
      url: (path_params) => {
        return `${BENCHER_API_URL}/v0/organizations/${path_params?.organization_slug}/projects/${path_params?.project_slug}`;
      },
      cards: [
        {
          kind: Card.FIELD,
          label: "Project Name",
          key: "name",
        },
        {
          kind: Card.FIELD,
          label: "Project Slug",
          key: "slug",
        },
        {
          kind: Card.FIELD,
          label: "Project Description",
          key: "description",
        },
        {
          kind: Card.FIELD,
          label: "Project URL",
          key: "url",
        },
        {
          kind: Card.FIELD,
          label: "Public Project",
          key: "public",
        },
      ],
      buttons: {
        path: (path_params) => {
          return `/console/projects/${path_params?.project_slug}/perf`
        },
      },
    },
  },
  [Operation.PERF]: {
    operation: Operation.PERF,
    header: {
      title: "Benchmark Perf",
    },
    plot: {
      url: () => {
        return `${BENCHER_API_URL}/v0/perf`;
      },
      tab_url: (path_params, tab: PerfTab) => {
        return `${BENCHER_API_URL}/v0/projects/${path_params?.project_slug}/${tab}`;
      },
      key_url: (path_params, tab: PerfTab, uuid: string) => {
        return `${BENCHER_API_URL}/v0/projects/${path_params?.project_slug}/${tab}/${uuid}`;
      },
    },
  },
};

export default projectsConfig;
