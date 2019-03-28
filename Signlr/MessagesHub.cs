using CumplimientoEntities.Models.Evaluacion;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace ServicioCliente.Signlr
{
    public class MessagesHub : Hub
    {
        private static string conString =
        ConfigurationManager.ConnectionStrings["Datransfer"].ToString();
        public void Hello()
        {
            Clients.All.hello();
        }

        [HubMethodName("sendMessages")]
        public static void SendMessages()
        {
            IHubContext context = GlobalHost.ConnectionManager.GetHubContext<MessagesHub>();
            context.Clients.All.updateMessages();
        }

        /// <summary>
        /// Obtener todos los cuestionarios 
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Cuestionario2> Cuestionarios()
        {
            var messages = new List<Cuestionario2>();
            using (var connection = new SqlConnection(conString))
            {
                connection.Open();
                using (var command = new SqlCommand(@"SELECT [IdCuestionario], 
                [Nombre], [Valor], [Estatus] FROM [dbo].[REM_CUESTIONARIO]", connection))
                {
                    command.Notification = null;

                    var dependency = new SqlDependency(command);
                    
                    dependency.OnChange += new OnChangeEventHandler(dependency_OnChange);
                   
                    if (connection.State == System.Data.ConnectionState.Closed)
                        connection.Open();

                    var reader = command.ExecuteReader();

                    while (reader.Read())
                    {
                        messages.Add(item: new Cuestionario2
                        {
                            IdCuestionario = (int)reader["IdCuestionario"],
                            Nombre = (string)reader["Nombre"],
                            Valor = (int)reader["Valor"],
                            Estatus = (bool)reader["Estatus"]
                        });
                    }
                }
            }
            return messages;
        }

        private void dependency_OnChange(object sender, SqlNotificationEventArgs e)
        {
            if (e.Type == SqlNotificationType.Change)
            {
                MessagesHub.SendMessages();
            }
        }
    }

}