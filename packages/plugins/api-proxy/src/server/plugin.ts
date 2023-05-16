import { InstallOptions, Plugin } from '@nocobase/server';
import { Context } from '@nocobase/actions';
import axios, { AxiosRequestConfig } from 'axios';

export class ApiProxyPlugin extends Plugin {
  afterAdd() {}

  beforeLoad() {}

  async load() {
    const { app, importCollections } = this;

    // 导入 collection
    // await importCollections(resolve(__dirname, './collections'));

    // 获取 User 插件
    // const userPlugin = this.app.getPlugin<any>('users');

    // 注册 OIDC 验证器
    // userPlugin.authenticators.register('oidc', oidc);

    // 注册接口
    // app.resource({
    //   name: 'proxy',
    //   actions: {
    //     async to(ctx: Context, next) {
    //       const { url, query } = ctx.request;
    //       const res = await axios({
    //         url: url,
    //         params: query
    //       })
    //       ctx.body = {
    //         status: 1
    //       }
    //       return next();
    //     }
    //   },
    // });

    app.actions({
      async ['article:create'](ctx, next) {
        const articleRepo = ctx.db.getRepository('article');
        const { body } = ctx.request;
        const res = await axios({
          url: 'http://localhost:9531' + '/api/crawler_url',
          method: 'POST',
          data: {
            url: body.url,
            content: body.content
          }
        })
        console.log(ctx.action.params.values);
        const result =  await articleRepo.create({
          values: {
            ...ctx.action.params.values,
            createdAt: ctx.state.currentUser.createdAt,
            createdBy: ctx.state.currentUser.id,
            updatedAt: ctx.state.currentUser.updatedAt,
            updatedBy: ctx.state.currentUser.id,
            title: res.data.data.title || body.title,
            uuid: res.data.data.uri,
          }
        });
        ctx.body = result;
        await next();
      }
    });

    app.use(async (ctx, next) => {
      const { url, query, body, method } = ctx.request;
      if (/^\/api\/proxy/.test(url)) {
        try {
          const res = await axios({
            url: 'http://localhost:9531' + url.replace(/^\/api\/proxy/g, ''),
            params: query,
            method: method as any,
            data: body
          })
          ctx.body = res.data.data;
        } catch (error) {
          ctx.body = error
        }
        await next();
      }
    });


    // 注册中间件，处理 nonce 值
    // this.app.use(async (ctx, next) => {
    //   if (ctx.url.startsWith('/api/users:signin?authenticator=oidc')) {
    //     ctx.OIDC_NONCE = this.#OIDC_NONCE;
    //   }
    //   if (ctx.url.startsWith('/api/oidc:getAuthUrl')) {
    //     ctx.OIDC_NONCE = this.#OIDC_NONCE = generators.nonce();
    //   }
    //   await next();
    // });

    app.acl.allow('proxy', '*', 'public');

  }

  async install(options?: InstallOptions) {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default ApiProxyPlugin;
