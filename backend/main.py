from flask import Flask
from flask_cors import CORS

from config import Config
from models import db, User
from routes.user_routes import user
from routes.admin_routes import admin
from routes.sda_owner_routes import sda_owner

from flask_jwt_extended import JWTManager

import os


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS:
    # - public APIs: open to all origins, no credentials
    # - everything else: allow credentials (for admin)
    CORS(app, supports_credentials=True)
    

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # init SQLAlchemy
    db.init_app(app)

    JWTManager(app)

    # register blueprints
    app.register_blueprint(user)
    app.register_blueprint(admin)
    app.register_blueprint(sda_owner)

    # create tables + default owner admin
    with app.app_context():
        db.create_all()

        owner = User.query.filter_by(username="owner").first()
        if not owner:
            owner = User(
                name="System Owner",
                username="owner", 
                role="Owner",
                email=" ",
                status="Active"
            )
            owner.set_password("ownerpassword123")
            db.session.add(owner)
            db.session.commit()
            print("Superadmin (owner) account created...")
        else:
            print(f"Owner already exists with id={owner.id}")
        

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
