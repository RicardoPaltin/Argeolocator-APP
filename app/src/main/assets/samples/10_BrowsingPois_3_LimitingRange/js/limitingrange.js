/*
    Information about server communication. This sample webservice is provided by Wikitude and returns random dummy
    places near given location.
 */


var markadores = [];
var aux = 0;


/* Implementation of AR-Experience (aka "World"). */
var World = {

    /*
        User's latest known location, accessible via userLocation.latitude, userLocation.longitude,
         userLocation.altitude.
     */
    userLocation: null,

    /* You may request new data from server periodically, however: in this sample data is only requested once. */
    isRequestingData: false,

    // True once data was fetched Verdadero una vez que se obtuvieron los datos.

    initiallyLoadedData: false,

    /* Different POI-Marker assets. */
    markerDrawableIdle: null,
    markerDrawableSelected: null,
    markerDrawableDirectionIndicator: null,

    /* List of AR.GeoObjects that are currently shown in the scene / World. */
    markerList: [],
    //m = new Marker(),




    /* the last selected marker. */
    currentMarker: null,

    locationUpdateCounter: 0,
    updatePlacemarkDistancesEveryXLocationUpdates: 5,

    /* Called to inject new POI data. */
    loadPoisFromJsonData: function loadPoisFromJsonDataFn(lat, lon, aux) {

        //AR.context.destroyAll();
        

        /* Show radar. */
        PoiRadar.show();

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

        for (let e = 0; e < aux; e++) {
            markadores[e].distance = DistanciaEntreDosPOI(markadores[e].latitude, markadores[e].longitude, lat, lon);
           

            //World.markerList.push(new Marker(markadores[0]));
            //console.log(markadores[e].distance);
        }
        
        markadores.sort(function (a, b) { return a.distance - b.distance });


        

        for (let e = 0; e < aux; e++) {
            //markadores[e].distance = DistanciaEntreDosPOI(markadores[e].latitude, markadores[e].longitude, lat, lon);]
            //markadores.sort(function (a, b) { return a.distance - b.distance });

            World.markerList.push(new Marker(markadores[e]));
            //console.log(markadores[e].distance);
        }

        

        for (let a = 0; a < aux; a++) {
            console.log(markadores[a].title);
            console.log(markadores[a].distance);

        }


        
        console.log("----------------------------------------------------------------");

        for (let e = 0; e < aux; e++) {
        
            console.log(World.markerList[e].latitude);
        }
        
        

        

        World.updateDistanceToUserValues();
        World.updateStatusMessage(aux + ' datos cargados desde Firestore');
        document.getElementById("panelRangeSliderValue").innerHTML = aux;

    },


    /*
        Sets/updates distances of all makers so they are available way faster than calling (time-consuming)
        distanceToUser() method all the time.

        
        Establece / actualiza las distancias de todos los puntos para que estén disponibles mucho más rápido
        distanceToUser () método todo el tiempo.
     */
    updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
        for (var i = 0; i < World.markerList.length; i++) {
            World.markerList[i].distanceToUser = World.markerList[i].markerObject.locations[0].distanceToUser();

        }
    },

    /* Updates status message shown in small "i"-button aligned bottom center. */
    updateStatusMessage: function updateStatusMessageFn(message, isWarning) {
        document.getElementById("popupButtonImage").src = isWarning ? "assets/warning_icon.png" : "assets/info_icon.png";
        document.getElementById("popupButtonTooltip").innerHTML = message;
    },

    /*
        Location updates, fired every time you call architectView.setLocation() in native environment.
        Actualizaciones de ubicación, que se activan cada vez que llama a architectView.setLocation () en un entorno nativo.

    */
    locationChanged: function locationChangedFn(lat, lon, alt, acc) {

        var auut = "(" + lat + " - " + lon + ")";


        document.getElementById("dial").innerHTML = auut + " ---> Cambio de localización";

        /* Store user's current location in World.userLocation, so you always know where user is. */
        World.userLocation = {
            'latitude': lat,
            'longitude': lon,
            'altitude': alt,
            'accuracy': acc
        };

        /* Request data if not already present. */
        if (!World.initiallyLoadedData) {
            World.requestDataFromServer(lat, lon);
            World.initiallyLoadedData = true;
            document.getElementById("dial").innerHTML = "Se consulta a firebase xq  no hay datos";
        } else {

            World.updateDistanceToUserValues();
            /*
                //Update placemark distance information frequently, you max also update distances only every 10m with some more effort.

            

            World.loadPoisFromJsonData(lat, lon);
            World.isRequestingData = false;

            document.getElementById("dial").innerHTML = "ACTUALIZACION DE MARCADORES"; */

            
            //
            //

           

        }

        /* Helper used to update placemark information every now and then (e.g. every 10 location upadtes fired). */
        World.locationUpdateCounter =
            (++World.locationUpdateCounter % World.updatePlacemarkDistancesEveryXLocationUpdates);

    },

    /*
        POIs usually have a name and sometimes a quite long description.
        Depending on your content type you may e.g. display a marker with its name and cropped description but
        allow the user to get more information after selecting it.
    */

    /* Fired when user pressed maker in cam. */
    onMarkerSelected: function onMarkerSelectedFn(marker) {
        World.closePanel();

        World.currentMarker = marker;

        /*
            In this sample a POI detail panel appears when pressing a cam-marker (the blue box with title &
            description), compare index.html in the sample's directory.
        */
        /* Update panel values. */
        document.getElementById("poiDetailTitle").innerHTML = marker.poiData.title;
        document.getElementById("poiDetailDescription").innerHTML = marker.poiData.description;

        /*
            It's ok for AR.Location subclass objects to return a distance of `undefined`. In case such a distance
            was calculated when all distances were queried in `updateDistanceToUserValues`, we recalculate this
            specific distance before we update the UI.
         */
        if (undefined === marker.distanceToUser) {
            marker.distanceToUser = marker.markerObject.locations[0].distanceToUser();
        }

        /*
            Distance and altitude are measured in meters by the SDK. You may convert them to miles / feet if
            required.
        */
        var distanceToUserValue = (marker.distanceToUser > 999) ?
            ((marker.distanceToUser / 1000).toFixed(2) + " km") :
            (Math.round(marker.distanceToUser) + " m");

        document.getElementById("poiDetailDistance").innerHTML = distanceToUserValue;

        /* Show panel. */
        document.getElementById("panelPoiDetail").style.visibility = "visible";
    },

    closePanel: function closePanel() {
        /* Hide panels. */
        document.getElementById("panelPoiDetail").style.visibility = "hidden";
        document.getElementById("panelRange").style.visibility = "hidden";

        if (World.currentMarker != null) {
            /* Deselect AR-marker when user exits detail screen div. */
            World.currentMarker.setDeselected(World.currentMarker);
            World.currentMarker = null;
        }
    },

    /* Screen was clicked but no geo-object was hit. */
    onScreenClick: function onScreenClickFn() {
        /* You may handle clicks on empty AR space too. */
        World.closePanel();
    },

    /* Returns distance in meters of placemark with maxdistance * 1.1. */
    getMaxDistance: function getMaxDistanceFn() {

        /* Sort places by distance so the first entry is the one with the maximum distance. */
        World.markerList.sort(World.sortByDistanceSortingDescending);

        /* Use distanceToUser to get max-distance. */
        var maxDistanceMeters = World.markerList[0].distanceToUser;



        /*
            Return maximum distance times some factor >1.0 so ther is some room left and small movements of user
            don't cause places far away to disappear.
         */


        return maxDistanceMeters * 1.1; // retorna la distancia máxima en metros Range
    },

    /* Updates values show in "range panel". */
    updateRangeValues: function updateRangeValuesFn() {

        /* Get current slider value (0..100);. */
        var slider_value = document.getElementById("panelRangeSlider").value;
        /* Max range relative to the maximum distance of all visible places. */
        var maxRangeMeters = Math.round(World.getMaxDistance() * (slider_value / 100));

        /* Range in meters including metric m/km. */
        var maxRangeValue = (maxRangeMeters > 0.1) ?
            ((maxRangeMeters / 1000).toFixed(2) + " km") :
            (Math.round(maxRangeMeters) + " m");

        /* Number of places within max-range. */
        var placesInRange = World.getNumberOfVisiblePlacesInRange(maxRangeMeters);

        /* Update UI labels accordingly. */
        document.getElementById("panelRangeValue").innerHTML = maxRangeValue;
        document.getElementById("panelRangePlaces").innerHTML = (placesInRange != 1) ?
            (placesInRange + " Places") : (placesInRange + " Place");
        document.getElementById("panelRangeSliderValue").innerHTML = slider_value;

        World.updateStatusMessage((placesInRange != 1) ?
            // (placesInRange + " places loaded") : (placesInRange + " place loaded"));

            (placesInRange + " PUNTO PUNTO") : (placesInRange + "PUNTO LOCALIZADO"));

        /* Update culling distance, so only places within given range are rendered. */
        AR.context.scene.cullingDistance = Math.max(maxRangeMeters, 1);


        /* Update radar's maxDistance so radius of radar is updated too. */
        PoiRadar.setMaxDistance(Math.max(maxRangeMeters, 1));
    },

    /* Returns number of places with same or lower distance than given range. */
    getNumberOfVisiblePlacesInRange: function getNumberOfVisiblePlacesInRangeFn(maxRangeMeters) {

        /* Sort markers by distance. */
        World.markerList.sort(World.sortByDistanceSorting);

        /* 
            Loop through list and stop once a placemark is out of range ( -> very basic implementation ). 
            Recorra la lista y deténgase una vez que una marca de posición esté fuera de rango (-> implementación muy básica)
        */
        for (var i = 0; i < World.markerList.length; i++) {
            if (World.markerList[i].distanceToUser < maxRangeMeters) {

                return i; // devuelve el número de punto en el rango 0,1,2,3,4,5,6....

            }
        }

        /* 
            In case no placemark is out of range -> all are visible.
            En caso de que ninguna marca de posición esté fuera de rango -> todas son visibles.
        
        */
        return World.markerList.length;

    },

    handlePanelMovements: function handlePanelMovementsFn() {
        PoiRadar.updatePosition();
    },

    /* Display range slider. */
    showRange: function showRangeFn() {
        if (World.markerList.length > 0) {
            World.closePanel();

            /* Update labels on every range movement. */
            World.updateRangeValues();
            World.handlePanelMovements();

            /* Open panel. */
            document.getElementById("panelRange").style.visibility = "visible";
        } else {

            /* No places are visible, because the are not loaded yet. */
            World.updateStatusMessage('No places available yet', true);
        }
    },

    /* Request POI data. */
    requestDataFromServer: function requestDataFromServerFn(lat, lon) {

        document.getElementById("dial").innerHTML = lat + " --- " + lon;

        /* Set helper var to avoid requesting places while loading. */
        World.isRequestingData = true;
        World.updateStatusMessage('Solicitando data de firestore');

        // Consulta en firestore



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

                var auut = "(" + lat + " , " + lon + ") ";

                document.getElementById("dial").innerHTML = auut + " ----> " + DistanciaEntreDosPOI(parseFloat(latitude), parseFloat(longitude), lat, lon);



                var singlePoi = {
                    "id": id,
                    "latitude": parseFloat(latitude),
                    "longitude": parseFloat(longitude),
                    "altitude": parseFloat(altitude),
                    "title": name,
                    "distance": DistanciaEntreDosPOI(parseFloat(latitude), parseFloat(longitude), lat, lon),
                    "description": description
                }
                markadores.push(singlePoi);

                //console.log(singlePoi.distance);
                aux = aux + 1;

            });
            markadores.sort(function (a, b) { return a.distance - b.distance });
            World.loadPoisFromJsonData(lat, lon,aux);
            World.isRequestingData = false;
        });

    },

    /* Helper to sort places by distance. */
    sortByDistanceSorting: function sortByDistanceSortingFn(a, b) {
        return a.distanceToUser - b.distanceToUser;
    },

    /* Helper to sort places by distance, descending. */
    sortByDistanceSortingDescending: function sortByDistanceSortingDescendingFn(a, b) {
        return b.distanceToUser - a.distanceToUser;
    },

    onError: function onErrorFn(error) {
        alert(error);
    }
};


/* Forward locationChanges to custom function. */
AR.context.onLocationChanged = World.locationChanged;

/* Forward clicks in empty area to World. */
AR.context.onScreenClick = World.onScreenClick;

function DistanciaEntreDosPOI(lat2, lon2, lat1, lon1) {


    var R = 6371; // km

    var dLat = (lat2 - lat1);

    var dLon = (lon2 - lon1);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +

        Math.cos(lat1) * Math.cos(lat2) *

        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var de = R * c;

    return de;
}