import prismaClient from "../../prisma";
import { compare } from "bcryptjs";
import { sign } from 'jsonwebtoken'

interface AuthRequest{
    email: string;
    password: string;
}

class AuthUserService {
    async execute({ email,password }: AuthRequest){
        //Verificar se o email existe
        const user = await prismaClient.user.findFirst({
            where:{
                email: email
            }
        })

        if(!user){
            throw new Error("Usuario/senha incorretos")
        }

        //Verificar se a senha esta correta
        const passwordMatch = await compare(password, user.password)

        if(!passwordMatch){
            throw new Error("Usuario/senha incorretos")
        }

        //Gerar Token JWT e devolver os dados do usuario como id,name e email.

        const token = sign (
            {
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                subject: user.id,
                expiresIn: '30d'
            }
        )

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            token: token
        }
    }
}

export { AuthUserService };