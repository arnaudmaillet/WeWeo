import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { getToken } from '~/providers/AuthProvider';

// Votre configuration AppSync
const HOST = 'o44bzjb5zneszdzsywl4ut5mga.appsync-api.eu-west-3.amazonaws.com';
const REGION = 'eu-west-3';
const URL = `https://${HOST}/graphql`;

// Configuration de l'authentification pour AppSync
const auth = {
  type: "AMAZON_COGNITO_USER_POOLS" as const,
  jwtToken: async () => {
    const token = await getToken(); // Récupère le jeton JWT de l'utilisateur authentifié
    if (!token) {
      throw new Error("JWT token is null");
    }
    return token;
  },
};

// Lien HTTP classique pour les requêtes standards
const httpLink = new HttpLink({ uri: URL });

// Configuration des liens avec authentification et WebSocket
const link = ApolloLink.from([
  createAuthLink({ url: URL, region: REGION, auth }),
  createSubscriptionHandshakeLink({ url: URL, region: REGION, auth }, httpLink),
]);

// Lien pour gérer les erreurs
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
    if (networkError && networkError.message && networkError.message.includes("Broken pipe")) {
      console.log("Attempting to reconnect due to broken pipe...");
    }
  }
});

// Configurer Apollo Client avec les liens et le cache
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, link]), // Combine les liens d'erreur, d'authentification, de subscription, et HTTP
  cache: new InMemoryCache(),
});

export default client;

