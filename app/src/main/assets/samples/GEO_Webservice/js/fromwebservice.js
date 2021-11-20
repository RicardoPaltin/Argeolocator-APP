/*
    Information about server communication. This sample webservice is provided by Wikitude and returns random dummy
    Places near given location.
 */

var marcadoresLista = [];
var aux;


/* Implementation of AR-Experience (aka "World"). */

var World = {
    /* You may request new data from server periodically, however: in this sample data is only requested once. */
    isRequestingData: false,

    /* True once data was fetched. */
    initiallyLoadedData: false,

    /* Different POI-Marker assets. */
    markerDrawableIdle: null,
    markerDrawableSelected: null,
    markerDrawableDirectionIndicator: null,

    /* List of AR.GeoObjects that are currently shown in the scene / World. */
    markerList: [],

    /* the last selected marker. */
    currentMarker: null,

    /* Called to inject new POI data. */
    loadPoisFromJsonData: function loadPoisFromJsonDataFn(marcadoresLista,aux) {



        /* Empty list of visible markers. */
        World.markerList = [];

        /* Start loading marker assets. */
        World.markerDrawableIdle = new AR.ImageResource("assets/marker_idle.png", {
            onError: World.onError
        });
        World.markerDrawableSelected = new AR.ImageResource("assets/marker_selected.png", {
            onError: World.onError
        });
        World.markerDrawableDirectionIndicator = new AR.ImageResource("assets/indi.png", {
            onError: World.onError
        });

        /* Loop through POI-information and create an AR.GeoObject (=Marker) per POI. */


        for (var i = 0; i < aux; i++) {
            World.markerList.push(new Marker(marcadoresLista[i]));

        }


        
        //console.log(marcadoresLista[currentPlaceNr]);



        


        World.updateStatusMessage(aux + ' places loaded');

    },

    /* Updates status message shown in small "i"-button aligned bottom center. */
    updateStatusMessage: function updateStatusMessageFn(message, isWarning) {
        document.getElementById("popupButtonImage").src = isWarning ? "assets/warning_icon.png" : "assets/info_icon.png";
        document.getElementById("popupButtonTooltip").innerHTML = message;
    },

    /*
        Location updates, fired every time you call architectView.setLocation() in native environment
        Note: You may set 'AR.context.onLocationChanged = null' to no longer receive location updates in
        World.locationChanged.
     */
    locationChanged: function locationChangedFn(lat, lon, alt, acc) {

        /* Request data if not already present. */
        if (!World.initiallyLoadedData) {
            World.requestDataFromServer(lat, lon);
            World.initiallyLoadedData = true;
        }
    },

    /* Fired when user pressed maker in cam. */
    /*Se activa cuando el usuario presiona/marcar un POI en la cámara*/
    onMarkerSelected: function onMarkerSelectedFn(marker) {

        /* Deselect previous marker. */
        /* Desmarcar POI seleccionado */
        if (World.currentMarker) {
            if (World.currentMarker.poiData.id === marker.poiData.id) {
                return;
            }
            World.currentMarker.setDeselected(World.currentMarker);
        }

        /* Highlight current one. */
        /* Resalta el marcador. */
        marker.setSelected(marker);
        World.currentMarker = marker;
    },

    /* Screen was clicked but no geo-object was hit. */
    /* Se desmarca el POI si hacen click en cualuqieer zona de la pantalla que no sea un punto. */
    onScreenClick: function onScreenClickFn() {
        if (World.currentMarker) {
            World.currentMarker.setDeselected(World.currentMarker);
        }
        World.currentMarker = null;
    },

    /*
        JavaScript provides a number of tools to load data from a remote origin.
        It is highly recommended to use the JSON format for POI information. Requesting and parsing is done in a
        few lines of code.
        Use e.g. 'AR.context.onLocationChanged = World.locationChanged;' to define the method invoked on location
        updates.
        In this sample POI information is requested after the very first location update.

        This sample uses a test-service of Wikitude which randomly delivers geo-location data around the passed
        latitude/longitude user location.
        You have to update 'ServerInformation' data to use your own own server. Also ensure the JSON format is same
        as in previous sample's 'myJsonData.js'-file.
    */
    /* Request POI data. */



    requestDataFromServer: function requestDataFromServerFn(lat, lon) {

        /* Set helper var to avoid requesting places while loading. */
        World.isRequestingData = true;
        World.updateStatusMessage('Requesting places from web-service');

        /* Use GET request to fetch the JSON data from the server */


        const db = firebase.firestore();

        const onGetTasks = (callback) => db.collection("poi").onSnapshot(callback);
        onGetTasks((querySnapshot) => {
            aux = 0;
            querySnapshot.forEach((doc) => {
                const task = doc.data();
                let altitude = task.altitude;
                let description = task.description;
                let id = task.id;
                let latitude = task.latitude;
                let longitude = task.longitude;
                let name = task.name;

                var singlePoi = {
                    "id": id,
                    "latitude": parseFloat(latitude),
                    "longitude": parseFloat(longitude),
                    "altitude": parseFloat(altitude),
                    "title": name,
                    "description": description
                };
                //console.log(singlePoi);

                marcadoresLista.push(singlePoi);
                aux = aux + 1;
            });
            World.loadPoisFromJsonData(marcadoresLista,aux);
            World.isRequestingData = false;


        });

        



    },

    onError: function onErrorFn(error) {
        alert(error);
    }


};

/* Forward locationChanges to custom function. */
AR.context.onLocationChanged = World.locationChanged;

/* Forward clicks in empty area to World. */
AR.context.onScreenClick = World.onScreenClick;