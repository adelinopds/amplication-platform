import React, { useCallback } from "react";
import { match, Switch, Route, useHistory } from "react-router-dom";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import { Snackbar } from "@rmwc/snackbar";
import "@rmwc/snackbar/styles";
import Sidebar from "./Sidebar";
import NewEntity from "./NewEntity";
import Entity from "./Entity";
import EntityListItem from "./EntityListItem";
import "./Entities.css";
import { formatError } from "../errorUtil";
import NewEntityField from "./NewEntityField";
import EntityField from "./EntityField";
import * as types from "./types";

type Props = {
  match: match<{ application: string }>;
};

type TData = {
  app: {
    entities: types.Entity[];
  };
};

function Entities({ match }: Props) {
  const { application } = match.params;

  const history = useHistory();

  const { data, loading, error } = useQuery<TData>(GET_ENTITIES, {
    variables: {
      id: application,
    },
  });

  const addField = useCallback(
    (entity) => {
      const params = new URLSearchParams({ "entity-name": entity.name });
      history.push(
        `/${application}/entities/${entity.id}/fields/new?${params}`
      );
    },
    [history, application]
  );

  const activateEntity = useCallback(
    (entity) => {
      history.push(`/${application}/entities/${entity.id}`);
    },
    [history, application]
  );

  const activateField = useCallback(
    (entity, field) => {
      history.push(`/${application}/entities/${entity.id}/fields/${field.id}`);
    },
    [history, application]
  );

  if (loading) {
    return <span>Loading...</span>;
  }

  const errorMessage = formatError(error);

  return (
    <>
      <main className="entities">
        {data?.app.entities.map((entity) => (
          <EntityListItem
            key={entity.id}
            entity={entity}
            onAddField={addField}
            onActivate={activateEntity}
            onActivateField={activateField}
          />
        ))}
      </main>
      <Sidebar>
        <Switch>
          <Route
            exact
            path="/:application/entities/new"
            component={NewEntity}
          />
          <Route
            exact
            path="/:application/entities/:entity/"
            component={Entity}
          />
          <Route
            exact
            path="/:application/entities/:entity/fields/new"
            component={NewEntityField}
          />
          <Route
            exact
            path="/:application/entities/:entity/fields/:fields"
            component={EntityField}
          />
        </Switch>
      </Sidebar>
      <Snackbar open={Boolean(error)} message={errorMessage} />
    </>
  );
}

export default Entities;

export const GET_ENTITIES = gql`
  query getEntities($id: String!) {
    app(where: { id: $id }) {
      id
      entities {
        id
        name
        fields {
          id
          displayName
          dataType
        }
      }
    }
  }
`;