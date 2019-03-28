using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(ServicioCliente.Startup))]
namespace ServicioCliente
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
            ConfigureAuth(app);
        }
    }
}
