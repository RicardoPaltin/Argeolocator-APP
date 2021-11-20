/*
    Information about server communication. This sample webservice is provided by Wikitude and returns random dummy
    places near given location.
 */

var marcadoresLista = [];
var aux;


/* Implementation of AR-Experience (aka "World"). */
var World = {

    /*
        User's latest known location, accessible via userLocation.latitude, userLocation.longitude,
         userLocation.altitude.
     */
    userLocation: null,

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

    locationUpdateCounter: 0,
    updatePlacemarkDistancesEveryXLocationUpdates: 20,

    /* Called to inject new POI data. */
    loadPoisFromJsonData: function loadPoisFromJsonDataFn(marcadoresLista, aux, lat, lon) {

        /* Destroys all existing AR-Objects (markers & radar). */
        AR.context.destroyAll();

        /* Show radar. */
        PoiRadar.show();

        /* Empty list of visible markers. */
        World.markerList = [];

        /* Start loading marker assets. */
        World.markerDrawableIdle = new AR.ImageResource("assets/marker_idle3.png", {
            onError: World.onError
        });
        World.markerDrawableSelected = new AR.ImageResource("assets/marker_selected2.png", {
            onError: World.onError
        });
        World.markerDrawableDirectionIndicator = new AR.ImageResource("assets/indi2.png", {
            onError: World.onError
        });


        for (var i = 0; i < aux; i++) {
            marcadoresLista[i].distancia = DistanciaEntreDosPOI(marcadoresLista[i].latitude, marcadoresLista[i].longitude, lat, lon);
            console.log("---------------------------");
            console.log(marcadoresLista[i].name);
            console.log(marcadoresLista[i].distancia);
            console.log("----------------------------");


        }



        marcadoresLista.sort(function (a, b) { return a.distancia - b.distancia });
        console.log("/////////////////////////////");

        console.log(marcadoresLista.length);

        console.log("/////////////////////////////");

        // for (var i = 0; i < aux; i++) {
        World.markerList.push(new Marker(marcadoresLista[0]));

        //}



        World.updateStatusMessage(aux + ' punto recuperado');
        /* Updates distance information of all placemarks. */
        World.updateDistanceToUserValues();
        World.updateRangeValues();

        /* Set distance slider to 100%. */
        document.getElementById("panelRangeSliderValue").innerHTML = 100;
    },

    /*
        Sets/updates distances of all makers so they are available way faster than calling (time-consuming)
        distanceToUser() method all the time.
     */
    updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
        for (var i = 0; i < World.markerList.length; i++) {
            World.markerList[i].distanceToUser = marcadoresLista[i].distancia;
        }
    },

    /* Updates status message shown in small "i"-button aligned bottom center. */
    updateStatusMessage: function updateStatusMessageFn(message, isWarning) {
        document.getElementById("popupButtonImage").src = isWarning ? "assets/warning_icon.png" : "assets/info_icon.png";
        document.getElementById("popupButtonTooltip").innerHTML = message;
    },

    /* Location updates, fired every time you call architectView.setLocation() in native environment. */
    locationChanged: function locationChangedFn(lat, lon, alt, acc) {

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
        } else if (World.locationUpdateCounter === 10) {
            /*
                Update placemark distance information frequently, you max also update distances only every 10m with
                some more effort.
             */

            World.initiallyLoadedData = true

            World.requestDataFromServer(lat, lon);
        } else if (World.locationUpdateCounter === 0) {

            World.updateDistanceToUserValues();
        }

        /* Helper used to update placemark information every now and then (e.g. every 10 location upadtes fired). */
        World.locationUpdateCounter =
            (++World.locationUpdateCounter % World.updatePlacemarkDistancesEveryXLocationUpdates);


        console.log("locationUpdateCounter");
        console.log(World.locationUpdateCounter);


    },

    /*
        POIs usually have a name and sometimes a quite long description.
        Depending on your content type you may e.g. display a marker with its name and cropped description but
        allow the user to get more information after selecting it.
    */

    /* Fired when user pressed maker in cam. */
    onMarkerSelected: function onMarkerSelectedFn(marker) {

        //World.closePanel();// Problemas al implementar esto! marca y desmarca error

        World.currentMarker = marker;

        // Get the modal
        var modal = document.getElementById("myModal");
        var body_modal = document.getElementById("body_modal");
        var header_modal = document.getElementById("header_modal");
        var modal_autor = document.getElementById("modal_autor");
        var modal_tecnica = document.getElementById("modal_tecnica");
        var modal_ubicacion = document.getElementById("modal _ubicacion");
        var footer_modal = document.getElementById("footer_modal");


        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks the button, open the modal 

        modal.style.display = "block";
        header_modal.innerHTML = marker.poiData.title;
        body_modal.innerHTML = marker.poiData.description;
        modal_autor.innerHTML = "<b>Autor: </b>" + marker.poiData.author;
        modal_tecnica.innerHTML = "<b>Técnica: </b>" + marker.poiData.technique;
        modal_ubicacion.innerHTML = "<b>Ubicación: </b> " + marker.poiData.location;
        footer_modal.innerHTML = "<b>fecha de actualización: </b>" + marker.poiData.date;

        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            modal.style.display = "none";

            World.closePanel();

        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
                World.closePanel();

            }
        }


    },


    /*
        It may make sense to display POI details in your native style.
        In this sample a very simple native screen opens when user presses the 'More' button in HTML.
        This demoes the interaction between JavaScript and native code.
    */
    /* User clicked "More" button in POI-detail panel -> fire event to open native screen. */
    onPoiDetailMoreButtonClicked: function onPoiDetailMoreButtonClickedFn() {

        
        var currentMarker = World.currentMarker;
        var markerSelectedJSON = {
            action: "present_poi_details",
            id: currentMarker.poiData.id,
            title: currentMarker.poiData.title,
            description: currentMarker.poiData.description
        };
        
           // The sendJSONObject method can be used to send data from javascript to the native code.
        
        AR.platform.sendJSONObject(markerSelectedJSON);
        
        

        //console.log("---------------------------");
        //console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
        //console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
        //console.log("----------------------------");


        
    },

    closePanel: function closePanel() {
        /* Hide panels. */
        //document.getElementById("panelPoiDetail").style.visibility = "hidden";
        //document.getElementById("panelRange").style.visibility = "hidden";

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
        return maxDistanceMeters * 1.1;
    },

    /* Updates values show in "range panel". */
    updateRangeValues: function updateRangeValuesFn() {

        /* Get current slider value (0..100);. */
        var slider_value = document.getElementById("panelRangeSlider").value;
        /* Max range relative to the maximum distance of all visible places. */
        var maxRangeMeters = Math.round(World.getMaxDistance() * (slider_value / 100));

        /* Range in meters including metric m/km. */
        var maxRangeValue = (maxRangeMeters > 999) ?
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
            (placesInRange + " dato descargado") : (placesInRange + " dato descargado"));

        /* Update culling distance, so only places within given range are rendered. */
        AR.context.scene.cullingDistance = Math.max(maxRangeMeters, 1);

        /* Update radar's maxDistance so radius of radar is updated too. */
        PoiRadar.setMaxDistance(Math.max(maxRangeMeters, 1));
    },

    /* Returns number of places with same or lower distance than given range. */
    getNumberOfVisiblePlacesInRange: function getNumberOfVisiblePlacesInRangeFn(maxRangeMeters) {

        /* Sort markers by distance. */
        World.markerList.sort(World.sortByDistanceSorting);

        /* Loop through list and stop once a placemark is out of range ( -> very basic implementation ). */
        for (var i = 0; i < World.markerList.length; i++) {
            if (World.markerList[i].distanceToUser > maxRangeMeters) {
                return i;
            }
        }

        /* In case no placemark is out of range -> all are visible. */
        return World.markerList.length;
    },

    handlePanelMovements: function handlePanelMovementsFn() {
        PoiRadar.updatePosition();
    },

    /* Display range slider. */
   

    /*
        You may need to reload POI information because of user movements or manually for various reasons.
        In this example POIs are reloaded when user presses the refresh button.
        The button is defined in index.html and calls World.reloadPlaces() on click.
    */

    /* Reload places from content source. */
    reloadPlaces: function reloadPlacesFn() {
        if (World.markerList.length > 0) {
            World.closePanel();
        }
        if (!World.isRequestingData) {
            if (World.userLocation) {
                World.requestDataFromServer(World.userLocation.latitude, World.userLocation.longitude);
            } else {
                World.updateStatusMessage('Ubicación de usuario desconocida.', true);
            }
        } else {
            World.updateStatusMessage('Solicitando puntos geolocalizados ...', true);
        }
    },

    /* Request POI data. */
    requestDataFromServer: function requestDataFromServerFn(lat, lon) {


        /* Set helper var to avoid requesting places while loading. */
        World.isRequestingData = true;
        World.updateStatusMessage('Solicitando data del servicio web');

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
                let technique = task.technique;
                let date = task.date;
                let author = task.author;
                let location = task.location;

                var singlePoi = {
                    "id": id,
                    "latitude": parseFloat(latitude),
                    "longitude": parseFloat(longitude),
                    "altitude": parseFloat(altitude),
                    "title": name,
                    "distancia": DistanciaEntreDosPOI(parseFloat(latitude), parseFloat(longitude), lat, lon),
                    "description": description,
                    "technique": technique,
                    "date": date,
                    "author": author,
                    "location": location
                };
                //console.log(singlePoi);

                marcadoresLista.push(singlePoi);
                aux = aux + 1;
            });
            World.loadPoisFromJsonData(marcadoresLista, aux, lat, lon);
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


    var R = 6371000; // km

    var dLat = (lat2 - lat1);

    var dLon = (lon2 - lon1);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +

        Math.cos(lat1) * Math.cos(lat2) *

        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var de = R * c;

    return de;
}
