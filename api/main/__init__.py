from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS

from api.main.config import config_by_name

flask_bcrypt = Bcrypt()


def create_app(config_name):
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(config_by_name[config_name])
    flask_bcrypt.init_app(app)

    return app
