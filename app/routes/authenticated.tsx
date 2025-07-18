import { observer } from "mobx-react";
import { Suspense } from "react";
import { Switch, Redirect, RouteComponentProps } from "react-router-dom";
import DocumentNew from "~/scenes/DocumentNew";
import Error404 from "~/scenes/Errors/Error404";
import AuthenticatedLayout from "~/components/AuthenticatedLayout";
import CenteredContent from "~/components/CenteredContent";
import PlaceholderDocument from "~/components/PlaceholderDocument";
import Route from "~/components/ProfiledRoute";
import WebsocketProvider from "~/components/WebsocketProvider";
import useCurrentTeam from "~/hooks/useCurrentTeam";
import usePolicy from "~/hooks/usePolicy";
import lazy from "~/utils/lazyWithRetry";
import {
  archivePath,
  draftsPath,
  homePath,
  searchPath,
  settingsPath,
  matchDocumentSlug as slug,
  trashPath,
} from "~/utils/routeHelpers";

const SettingsRoutes = lazy(() => import("./settings"));
const Archive = lazy(() => import("~/scenes/Archive"));
const Collection = lazy(() => import("~/scenes/Collection"));
const DocumentRouter = lazy(() => import("./DocumentRouter"));
const Reader = lazy(() => import("~/scenes/Reader"));
const Drafts = lazy(() => import("~/scenes/Drafts"));
const Home = lazy(() => import("~/scenes/Home"));
const Search = lazy(() => import("~/scenes/Search"));
const Trash = lazy(() => import("~/scenes/Trash"));

const RedirectDocument = ({
  match,
}: RouteComponentProps<{ documentSlug: string }>) => (
  <Redirect
    to={
      match.params.documentSlug
        ? `/doc/${match.params.documentSlug}`
        : homePath()
    }
  />
);

/**
 * The authenticated routes are all the routes of the application that require
 * the user to be logged in.
 */
function AuthenticatedRoutes() {
  const team = useCurrentTeam();
  const can = usePolicy(team);

  return (
    <Switch>
      <WebsocketProvider>
        <AuthenticatedLayout>
          <Suspense
            fallback={
              <CenteredContent>
                <PlaceholderDocument />
              </CenteredContent>
            }
          >
            <Switch>
              {can.createDocument && (
                <Route exact path={draftsPath()} component={Drafts} />
              )}
              {can.createDocument && (
                <Route exact path={archivePath()} component={Archive} />
              )}
              {can.createDocument && (
                <Route exact path={trashPath()} component={Trash} />
              )}
              <Route path={`${homePath()}/:tab?`} component={Home} />
              <Redirect from="/dashboard" to={homePath()} />
              <Redirect exact from="/starred" to={homePath()} />
              <Redirect
                exact
                from="/templates"
                to={settingsPath("templates")}
              />
              <Redirect exact from="/collections/*" to="/collection/*" />
              <Route exact path="/collection/:id/new" component={DocumentNew} />
              <Route
                exact
                path="/collection/:id/:tab?"
                component={Collection}
              />
              <Route exact path="/doc/new" component={DocumentNew} />
              <Route exact path={`/d/${slug}`} component={RedirectDocument} />
              <Route
                exact
                path={`/doc/${slug}/history/:revisionId?`}
                component={DocumentRouter}
              />
              <Route
                exact
                path={`/doc/${slug}/insights`}
                component={DocumentRouter}
              />
              <Route exact path={`/doc/${slug}/edit`} component={DocumentRouter} />
              <Route path={`/doc/${slug}`} component={DocumentRouter} />
              <Route
                exact
                path={`${searchPath()}/:query?`}
                component={Search}
              />
              <Route path="/404" component={Error404} />
              <SettingsRoutes />
              <Route component={Error404} />
            </Switch>
          </Suspense>
        </AuthenticatedLayout>
      </WebsocketProvider>
    </Switch>
  );
}

export default observer(AuthenticatedRoutes);
