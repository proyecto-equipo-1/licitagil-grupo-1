import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'licitagilStorage',
  access: (allow) => ({
    'uploads/pdfs/*': [
      allow.guest.to(['read', 'write', 'delete'])
    ],
    'public/*': [
      allow.guest.to(['read', 'write'])
    ]
  })
});