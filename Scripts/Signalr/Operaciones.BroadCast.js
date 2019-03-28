var RemesasSglr = {};

RemesasSglr.Init = function () {
    var x = 1;
    //$('#divNotifica').hide();
    $('#btnProcesaInfo').on('click', function () {
        $("#divTransaccion").slideToggle("slow");
        $("#divFiltro").hide();
        $("#logSearch").hide();
        RemesasSglr.ProcesarInfo();
    });
    $('#btnFiltrar').on('click', function () {
        $("#divFiltro").slideToggle("slow");
        $("#divTransaccion").hide();
    });
    $("#btnBuscaLog").click(function () {
        var fecha = $("#date").val();
        var bandera1 = (document.getElementById('radio_one').checked == true) ? "1" : "0";
        var bandera2 = (document.getElementById('radio_two').checked == true) ? "2" : "0";
        RemesasSglr.Load(fecha, bandera1, bandera2);
    });

    $("#btnDescargarLog").click(function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var fecha = $("#date").val();
        var tipo = (document.getElementById('radio_two').checked == true) ? true : (document.getElementById('radio_one').checked == true) ? false : null;
        var object = {};
        object.tipo = tipo;
        object.fecha = fecha;
        var consulta = Consultar('ExisteLg', JSON.stringify(object));
        if (consulta == true) {
            var ajax = new XMLHttpRequest();
            var parameters = JSON.stringify(object);
            ajax.open("Post", "DwLog", true);
            ajax.setRequestHeader("Content-type", "application/json; charset=utf-8");
            ajax.setRequestHeader("Content-length", parameters.length);
            ajax.setRequestHeader("Connection", "close");
            ajax.responseType = "blob";
            ajax.onreadystatechange = function() {
                if (this.readyState == 4) {
                    var blob = new Blob([this.response], { type: "application/octet-stream" });
                    var fileName = RemesasSglr.ObtenerNombre(tipo, fecha, ".txt");
                    saveAs(blob, fileName);
                }
            };
            ajax.send(parameters);
        } else {
            RemesasNotificaciones.GenerarValidaciones("[Datransfer][Error]:No se encontro registro de log en esa fecha");
        }
    });
}

RemesasSglr.ObtenerNombre = function(tipo, fecha, format) {
    if (tipo == true) {
        return "PAGO_" + fecha + "." + format;
    } else if (tipo == false) {
        return "ENVIO_" + fecha + "." + format;
    } else {
        return fecha + "." + format;
    }
}

RemesasSglr.Load = function (fecha, b1, b2) {
    $("#textLog").empty();
    $.ajaxSetup({
        cache: false,
        type: "GET",
        url: "GetLog",
        beforeSend: function() {
            $(".loadMedia").show();
        },
        complete: function() {
            $(".loadMedia").hide();
        },
        error: function() {
            RemesasNotificaciones.GenerarValidaciones(" [Datransfer][Error]:No se pudo procesar la solicitud");
        }
    });
    $.ajax({
        data: { env: b1, pag: b2, fechaInicio: fecha },
        success: function(resp) {
            $("#logSearch").show();
            $("#textLog").append(resp);
        },
        error: function(xhr, ajaxOptions, thrownError) {
            RemesasNotificaciones.GenerarValidaciones(" [Datransfer][Error]:No se pudo procesar la solicitud");
        }
    });
}

RemesasSglr.BuildNoty = function () {
    var noty = $.connection.NotificationHub;
    noty.client.WriteNotication = function (r_count) {
        if (r_count > 0) {
            RemesasNotificaciones.Notificaciones();
        } 
    }
    $.connection.hub.start().done(function () {
        setInterval(function () {
            noty.server.writeNoty();
        }, 9000);

    }).fail(function (e) {
        alert(e);
    });
}


RemesasSglr.ProcesarInfo = function () {
    var notifications = $.connection.NotificationHub;
    notifications.client.recieveNotification = function (totalNewMessages, totalNewCircles, totalNewJobs, totalNewNotifications, contains) {
        var desplegados = 0;
        var totalArchivo = 0;
        if (contains != null) {
            var desplegados = $('#tabDatos2 tr:last').index();
            var lineas = "";
            for (var numlinea = contains.length; numlinea > desplegados; numlinea--) {
                var indice = numlinea - 1;
                if (contains[indice] != null || contains[indice] == '') {
                    $('<tr class="anim"><td>' + contains[indice] + '</td></tr>').prependTo('table tbody');
                }
            };
            $('#ulDatos').append(lineas);
        }
    };

    notifications.client.grabaNotifications = function (y) {
        var x = y;
    };

    $.connection.hub.start().done(function () {
        setInterval(function () {
            notifications.server.saveNotifications();
        }, 7000);
        setInterval(function () {
            notifications.server.sendNotifications();
        }, 4000);
    }).fail(function (e) {
        alert(e);
    });
}

