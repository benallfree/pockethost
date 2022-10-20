import { Collection, SchemaField } from 'pocketbase'

export type Collection_Serialized = Omit<Partial<Collection>, 'schema'> & {
  schema: Array<Partial<SchemaField>>
}

export const collections_001: Collection_Serialized[] = [
  {
    id: 'systemprofiles0',
    name: 'profiles',
    system: true,
    listRule: 'userId = @request.user.id',
    viewRule: 'userId = @request.user.id',
    createRule: 'userId = @request.user.id',
    updateRule: 'userId = @request.user.id',
    deleteRule: null,
    schema: [
      {
        id: 'pbfielduser',
        name: 'userId',
        type: 'user',
        system: true,
        required: true,
        unique: true,
        options: {
          maxSelect: 1,
          cascadeDelete: true,
        },
      },
      {
        id: 'pbfieldname',
        name: 'name',
        type: 'text',
        system: false,
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: '',
        },
      },
      {
        id: 'pbfieldavatar',
        name: 'avatar',
        type: 'file',
        system: false,
        required: false,
        unique: false,
        options: {
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: [
            'image/jpg',
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/gif',
          ],
          thumbs: null,
        },
      },
    ],
  },
  {
    id: 'etae8tuiaxl6xfv',
    name: 'instances',
    system: false,
    listRule: 'uid=@request.user.id',
    viewRule: 'uid = @request.user.id',
    createRule: "uid = @request.user.id && (status = 'idle' || status = '')",
    updateRule: null,
    deleteRule: null,
    schema: [
      {
        id: 'qdtuuld1',
        name: 'subdomain',
        type: 'text',
        system: false,
        required: true,
        unique: true,
        options: {
          min: null,
          max: 50,
          pattern: '^[a-z][\\-a-z]+$',
        },
      },
      {
        id: 'rbj14krn',
        name: 'uid',
        type: 'user',
        system: false,
        required: true,
        unique: false,
        options: {
          maxSelect: 1,
          cascadeDelete: false,
        },
      },
      {
        id: 'c2y74d7h',
        name: 'status',
        type: 'text',
        system: false,
        required: false,
        unique: false,
        options: {
          min: null,
          max: null,
          pattern: '',
        },
      },
      {
        id: '3rinhcnt',
        name: 'bin',
        type: 'text',
        system: false,
        required: false,
        unique: false,
        options: {
          min: 0,
          max: 30,
          pattern: '',
        },
      },
    ],
  },
]
