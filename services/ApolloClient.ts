import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { getToken } from '~/providers/AuthProvider';


const httpLink = new HttpLink({
  uri: 'https://o44bzjb5zneszdzsywl4ut5mga.appsync-api.eu-west-3.amazonaws.com/graphql', // Remplace par l'URL de ton API AppSync
});

const wsLink = new GraphQLWsLink(
    createClient({
      url: 'wss://o44bzjb5zneszdzsywl4ut5mga.appsync-realtime-api.eu-west-3.amazonaws.com/graphql', // Remplace par l'URL de WebSocket de ton API AppSync
      connectionParams: async () => {
        const token = await getToken();
        return {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        };
      },
    })
  );

const authLink = setContext(async (_, { headers }) => {
  const token = await getToken(); // Récupère le token JWT de Cognito
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
  
  

export default client;
