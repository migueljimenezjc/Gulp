using System;

namespace ServicioCliente.Controllers
{
    public class HomeController : Controller
    {
        [Route("GetLog")]
        public ActionResult Log(string env, string pag, string fechaInicio)
        {
            var log = LeerLog.GetContentLog(env, pag, fechaInicio);
            return Content(log);
        }
    }
}