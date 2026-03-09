import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";

@Schema({timestamps: true})
export class Auth{
    @Prop({ type: String, required: true })
    login: string;

    @Prop({ type: String, required: true })
    email: string;

    createdAt: Date;

    static createInstance(login:string, email:string) : AuthDocument {
        const auth = new this();
        auth.login = login;
        auth.email = email;
        return auth as AuthDocument;
    }

    update(dto: {login: string, email: string}) {
        this.login = dto.login;
        this.email = dto.email;
    }
}

export const AuthShema = SchemaFactory.createForClass(Auth);
AuthShema.loadClass(Auth);

export type AuthDocument = HydratedDocument<Auth>
export type AuthModelType = Model<AuthDocument> & typeof Auth