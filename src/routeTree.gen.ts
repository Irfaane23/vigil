/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from "./routes/__root";
import { Route as WardRouteImport } from "./routes/ward";
import { Route as IndexRouteImport } from "./routes/index";
import { Route as BedsidePatientIdRouteImport } from "./routes/bedside.$patientId";

const WardRoute = WardRouteImport.update({
  id: "/ward",
  path: "/ward",
  getParentRoute: () => rootRouteImport,
} as any);
const IndexRoute = IndexRouteImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRouteImport,
} as any);
const BedsidePatientIdRoute = BedsidePatientIdRouteImport.update({
  id: "/bedside/$patientId",
  path: "/bedside/$patientId",
  getParentRoute: () => rootRouteImport,
} as any);

export interface FileRoutesByFullPath {
  "/": typeof IndexRoute;
  "/ward": typeof WardRoute;
  "/bedside/$patientId": typeof BedsidePatientIdRoute;
}
export interface FileRoutesByTo {
  "/": typeof IndexRoute;
  "/ward": typeof WardRoute;
  "/bedside/$patientId": typeof BedsidePatientIdRoute;
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport;
  "/": typeof IndexRoute;
  "/ward": typeof WardRoute;
  "/bedside/$patientId": typeof BedsidePatientIdRoute;
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths: "/" | "/ward" | "/bedside/$patientId";
  fileRoutesByTo: FileRoutesByTo;
  to: "/" | "/ward" | "/bedside/$patientId";
  id: "__root__" | "/" | "/ward" | "/bedside/$patientId";
  fileRoutesById: FileRoutesById;
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  WardRoute: typeof WardRoute;
  BedsidePatientIdRoute: typeof BedsidePatientIdRoute;
}

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/ward": {
      id: "/ward";
      path: "/ward";
      fullPath: "/ward";
      preLoaderRoute: typeof WardRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/": {
      id: "/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof IndexRouteImport;
      parentRoute: typeof rootRouteImport;
    };
    "/bedside/$patientId": {
      id: "/bedside/$patientId";
      path: "/bedside/$patientId";
      fullPath: "/bedside/$patientId";
      preLoaderRoute: typeof BedsidePatientIdRouteImport;
      parentRoute: typeof rootRouteImport;
    };
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  WardRoute: WardRoute,
  BedsidePatientIdRoute: BedsidePatientIdRoute,
};
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();
