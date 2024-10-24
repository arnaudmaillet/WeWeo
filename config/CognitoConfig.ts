import { CognitoUserPool } from 'amazon-cognito-identity-js';


export const userPool = new CognitoUserPool({
  UserPoolId: 'eu-west-3_HXmCngCxz',
  ClientId: '63gilftoa4rctc9t6v7g1g1fr9'
});