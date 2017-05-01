from eve import Eve
from eve.auth import BasicAuth
import os

class Authenticate(BasicAuth):
    def check_auth(self, username, password, allowed_roles, resource,
                   method):
        """        print("checking auth", resource, method)
        if resource == 'user' and method == 'GET':
            user = app.data.driver.db['user']
            user = user.find_one({'username': username,'password':password})
            if user:
                return True
            else:
                return False
        elif resource == 'user' and method == 'POST':
            return username == 'admin' and password == 'admin'
        else:
            print("auth")
            return True"""
        if resource == 'user':
            if method == "GET":
                user = app.data.driver.db['user']
                user = user.find_one({'username': username,'password':password})
                if user:
                    return True
                else:
                    return False
            elif method == "POST":
                return username == 'admin' and password == 'admin'
        else:
            return True

class Authenticate(BasicAuth):
    def check_auth(self, username, password, allowed_roles, resource,
                   method):
        if resource == 'user' and method == 'GET':
            user = app.data.driver.db['user']
            user = user.find_one({'username': username,'password':password})
            if user:
                return True
            else:
                return False
        elif resource == 'user' and method == 'POST':
            return username == 'admin' and password == 'admin'
        else:
            return True

if __name__ == '__main__':
    app = Eve() #auth=Authenticate)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
