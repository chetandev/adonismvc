import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Post from "App/Models/Post";
import Database from '@ioc:Adonis/Lucid/Database'



export default class PostsController {
     public async index()
    {
        const posts = await Post.query().preload('user').preload('forum');
        return posts
    }

    public async fromqb()
    {
        return Database
        . from('posts')
        . select('*')
        . orderBy('creared_at', 'desc')
        . paginate(1,10)        
    }


    /**
     * 
     * @param param0 
     * @returns 
     */
    public async show({ params}: HttpContextContract)
    {
        try {
            const post = await Post.find(params.id);
            if(post){
                await post.preload('user')
                await post.preload('forum');
                return post
            }
        } catch (error) {
            console.log(error)
        }
        
    }


    public async update({request, params}: HttpContextContract)
    {
        const post = await Post.find(params.id);

        if (post) {
            post.title = request.input('title');
            post.content = request.input('content');
            if (await post.save()) {
                await post.preload('user')
                await post.preload('forum')
                return post
            }
            return; // 422
        }

        return; // 401
    }


    public async store({ auth ,request}: HttpContextContract)
    {
        const user = await auth.authenticate();
        const post = new Post();
        post.title = request.input('title');
        post.content = request.input('content');
        post.forumId = request.input('forum');
        await user.related('posts').save(post);
        return post
    }

    public async destroy({response, auth, params}: HttpContextContract)
    {
       const user = await auth.authenticate();
       const post = await Post.query().where('user_id', user.id).where('id', params.id).delete();
       console.log(post)
       return response.redirect('/dashboard');
    }
}