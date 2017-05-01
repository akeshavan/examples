import os
DOMAIN = {
    'user': {
        'schema': {
            'firstname': {
                'type': 'string'
            },
            'lastname': {
                'type': 'string'
            },
            'username': {
                'type': 'string',
                 'unique': True
            },
            'password': {
                'type': 'string'
            },
            'phone': {
                'type': 'string'
            }
        },
        'additional_lookup': {
                'url': 'regex("[\w]+")',
                'field': 'username',
                }
    },
    'image': {
        'schema': {
            'base_image_url':{
                'type': 'string' #pointer to .JPG living on dropbox
                },
            'initial_data_url': {
                'type': 'string' #pointer to JSON file living on dropbox
                },
            'truth_data':{
                'type': 'string' #pointer to JSON file living on dropbox
                },
            'username': {
                'type': 'string' #person who uploaded_data
                },
            'task':{
                'type': 'string' #flair_ms_lesion, or brainmask, or whatever
                },
            'mode':{
                'type': 'string' #train (give feedback) or test or validate (show what other people did?)
                }
            },
        'additional_lookup': {
                'url': 'regex("[\w]+")',
                'field': 'username',
                }
        },
        'edits': {
            'schema': {
                'image_id':{
                    'type': 'string' #corresponds to the _id field in the image collection
                    },
                'edit_data': {
                    'type': 'string' #JSON serialized dictionary?
                    },
                'player_id': {
                    'type': 'string' #name of the player who made edits
                    }
                },
            'additional_lookup': {
                    'url': 'regex("[\w]+")',
                    'field': 'image_id',
                    }
            },
        'player': {
            'schema': {
                'edit_data_id': {
                    'type': 'list',
                    'schema': {'type': 'string'}
                    },
                'name': {
                    'type': 'string' #name of the player who made edits
                    },
                'xp' : {
                    'type': 'integer' #number of voxels marked
                    },
                'accuracy' : {
                    'type': 'float' #number of correct voxels - #false positive -#false negative
                    }
                # will add a scorecard when i think of it.
                },
            'additional_lookup': {
                    'url': 'regex("[\w]+")',
                    'field': 'name',
                    }
            }
}

RESOURCE_METHODS = ['GET','POST','DELETE']

ITEM_METHODS = ['GET','PATCH','DELETE']

X_DOMAINS = '*'
X_HEADERS = ['Authorization','If-Match','Access-Control-Expose-Headers','Content-Type','Pragma','Cache-Control']
X_EXPOSE_HEADERS = ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']

# We want to seamlessy run our API both locally and on Heroku. If running on
# Heroku, sensible DB connection settings are stored in environment variables.
#MONGO_HOST = os.environ.get('MONGO_HOST', 'localhost')
#MONGO_PORT = os.environ.get('MONGO_PORT', 27017)
MONGO_URI = os.environ.get("MONGODB_URI", None)

print("MONGO host and port is:", MONGO_URI)
#MONGO_USERNAME = os.environ.get('MONGO_USERNAME', 'user')
#MONGO_PASSWORD = os.environ.get('MONGO_PASSWORD', 'user')
#MONGO_DBNAME = os.environ.get('MONGO_DBNAME', 'evedemo')
