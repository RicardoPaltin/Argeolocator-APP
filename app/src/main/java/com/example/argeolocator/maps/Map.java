package com.example.argeolocator.maps;


import static androidx.constraintlayout.motion.utils.Oscillator.TAG;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.fragment.app.DialogFragment;

import android.Manifest;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentSender;
import android.content.pm.PackageManager;

import android.location.Location;

import android.os.Build;
import android.os.Bundle;

import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.widget.TextClock;
import android.widget.TextView;
import android.widget.Toast;

import com.example.argeolocator.R;
import com.example.argeolocator.db.POI;
import com.example.argeolocator.db.firestore;
import com.example.argeolocator.location.LocationProvider;
import com.example.argeolocator.wikitude.VistaWikitude;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.ResolvableApiException;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.location.LocationSettingsResponse;
import com.google.android.gms.location.LocationSettingsStatusCodes;
import com.google.android.gms.location.SettingsClient;
import com.google.android.gms.maps.CameraUpdate;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;

import java.util.ArrayList;
import java.util.Objects;


public class Map extends AppCompatActivity implements OnMapReadyCallback, ModalDialog.BottomSheetListener {

    private GoogleMap mMap;
    FirebaseFirestore db = FirebaseFirestore.getInstance();
    ArrayList<POI> lista = new ArrayList<POI>();
    private LocationProvider locationProvider;

    private double latx;
    private double lonx;

    private static final int REQUEST_CHECK_SETTINGS = 102;

    // La clase FusedLocationProviderClient
    private FusedLocationProviderClient fusedLocationClient;

    // La clase LocationCallback se utiliza para recibir notificaciones de FusedLocationProviderApi
    // cuando la ubicación del dispositivo ha cambiado o ya no se puede determinar.
    private LocationCallback mlocationCallback;

    // La clase LocationSettingsRequest.Builder extiende un Object
    // y construye una LocationSettingsRequest.
    private LocationSettingsRequest.Builder builder;

    // La clase LocationRequest sirve para  para solicitar las actualizaciones
    // de ubicación de FusedLocationProviderApi
    public LocationRequest mLocationRequest;

    // Marcador para la ubicación del usuario
    Marker marker;
    Marker marker_poi;




    @Override
    protected void onCreate(Bundle savedInstanceState) {
        //recuperarDatosFirebase();
        super.onCreate(savedInstanceState);
        setContentView(R.layout.map);

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map);
        mapFragment.getMapAsync(this);

        // Hago uso de FusedLocationProviderClient
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        // Obtain the SupportMapFragment and get notified when the map is ready to be used.
        //SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map);
        //mapFragment.getMapAsync(this);

        // Hago uso de FusedLocationProviderClient
        // fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        // Método para obtener la última ubicación del usuario (Lo crearé más adelante)


        obtenerUltimaUbicacion();

        // Con LocationCallback enviamos notificaciones de la ubicación del usuario
        mlocationCallback = new LocationCallback() {
            @Override
                public void onLocationResult(LocationResult locationResult) {

                    // Si no hay coordenadas de la ubicación del usuario le pasamos un return
                    if (locationResult == null) {
                        return;
                    }

                    // Cuando obtenemos la coordenadas de ubicación del usuario, agregamos
                    // un marcador para la ubicación del usuario con el método agregarMarcador()
                    // el cual crearé más adelante
                    for (Location location : locationResult.getLocations()) {
                        agregarMarcador(location.getLatitude(),location.getLongitude());
                        //Log.e("Coordenadas: ", location.toString());
                    }

                };
            };

        mLocationRequest = createLocationRequest();
        builder = new LocationSettingsRequest.Builder().addLocationRequest(mLocationRequest);
        checkLocationSetting(builder);


    }

    public void onButtonClicked(String text){
        //texto.setText(text); comunicacion entre el fragmento y los botones
   }

    @Override
    protected void onStart() {
        super.onStart();

    }

    public void recuperarDatosFirebase(){

        ArrayList<POI> poiAux = new ArrayList<POI>();


        db.collection("poi").get().addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {

            @Override
            public void onComplete(@NonNull Task<QuerySnapshot> task) {

                if (task.isSuccessful()) {
                    for (QueryDocumentSnapshot document : task.getResult()) {

                        //Log.d(TAG, document.getId() + " => " + document.getData().get("description"));
                        POI po = new POI();
                        String name = document.getString("name");
                        String id =document.getString("id");
                        String description = document.getString("description");
                        double latitude = Double.parseDouble(Objects.requireNonNull(document.getString("latitude")));
                        double longitude = Double.parseDouble(Objects.requireNonNull(document.getString("longitude")));
                        po.setName(name);
                        po.setDescription(description);
                        po.setLatitude(latitude);
                        po.setId(id);
                        po.setLongitude(longitude);
                        lista.add(po);
                    }
                } else {
                    Log.d(TAG, "Error getting documents: ", task.getException());
                }
            }
        });
        leerArray();
    }

    public void leerArray(){

        //Log.d("11111111111111","entrada al ciclo for" );

        for (int i = 0; i < lista.size(); i++){

            String aux = lista.get(i).getName();
            //Log.d("www90909",aux );
            //Log.d("99999999","este es un ejemplo" );
        }
    }

    @Override
    public void onMapReady(GoogleMap googleMap) {

        mMap = googleMap;

        db.collection("poi").get().addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {

            @Override
            public void onComplete(@NonNull Task<QuerySnapshot> task) {
                LatLng x;
                if (task.isSuccessful()) {
                    for (QueryDocumentSnapshot document : task.getResult()) {

                        Log.d(TAG, document.getId() + " => " + document.getData().get("description"));
                        POI po = new POI();
                        String name = document.getString("name");
                        String id =document.getString("id");
                        String description = document.getString("description");
                        double latitude = Double.parseDouble(Objects.requireNonNull(document.getString("latitude")));
                        double longitude = Double.parseDouble(Objects.requireNonNull(document.getString("longitude")));
                        String author = document.getString("author");
                        String technique = document.getString("technique");
                        String location = document.getString("location");
                        String date = document.getString("date");

                        po.setName(name);
                        po.setDescription(description);
                        po.setLatitude(latitude);
                        po.setId(id);
                        po.setLongitude(longitude);
                        po.setAuthor(author);
                        po.setTechnique(technique);
                        po.setLocation(location);
                        po.setDate(date);
                        lista.add(po);
                    }
                } else {
                    Log.d(TAG, "Error getting documents: ", task.getException());
                }
                for (int i = 0; i < lista.size() ; i++) {
                    x = new LatLng(lista.get(i).getLatitude(), lista.get(i).getLongitude());
                    marker_poi = mMap.addMarker(new MarkerOptions()
                            .position(x)
                            .title(lista.get(i).getName())
                            .icon(BitmapDescriptorFactory
                                    .fromResource(R.drawable.poi15_50px)
                            )
                    );
                    //marker_poi.showInfoWindow();

                }
            }
        });

        leerArray();


        mMap.setOnMarkerClickListener(new GoogleMap.OnMarkerClickListener() {
            @Override
            public boolean onMarkerClick(Marker marker) {

                String a = marker.getTitle();
                for (int i=0; i < lista.size();i++){
                    if(a.equals(lista.get(i).getName())){


                        ModalDialog modal = new ModalDialog();
                        modal.show(getSupportFragmentManager(),"modalinformacion");

                        Bundle datosAEnviar = new Bundle();
                        //datosAEnviar.putLong("id", 123L);
                        //datosAEnviar.putInt("edad", 21);
                        datosAEnviar.putString("titulo", lista.get(i).getName());
                        datosAEnviar.putString("descripcion", lista.get(i).getDescription());
                        datosAEnviar.putString("autor", lista.get(i).getAuthor());
                        datosAEnviar.putString("fecha", lista.get(i).getDate());
                        datosAEnviar.putString("tecnica", lista.get(i).getTechnique());
                        datosAEnviar.putString("ubicacion", lista.get(i).getLocation());

                       modal.setArguments(datosAEnviar);


                    }

                }

                return false;
            }
        });


    }
    // -------------------------------------------------------------------------------------------------------- //

    @SuppressLint("SetTextI18n")
    private void agregarMarcador(double lat, double lng) {

        LatLng coordenadas = new LatLng(lat, lng);

        latx = coordenadas .latitude;
        lonx = coordenadas.longitude;
        CameraUpdate miUbicacion = CameraUpdateFactory.newLatLngZoom(coordenadas, 21);
        if (marker != null) marker.remove();
        marker = mMap.addMarker(new MarkerOptions()
                .position(coordenadas)
                .title("Tu posición")
                .icon(BitmapDescriptorFactory.fromResource(R.drawable.here2))
                );
        marker.showInfoWindow();
        mMap.animateCamera(miUbicacion);

    }

    private void obtenerUltimaUbicacion() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                // TODO: Consider calling
                //    Activity#requestPermissions

                // muestra una ventana o Dialog en donde el usuario debe
                // dar permisos para el uso del GPS de su dispositivo.
                // El método dialogoSolicitarPermisoGPS() lo crearemos más adelante.
                dialogoSolicitarPermisoGPS();

            }
        }

    }
    protected LocationRequest createLocationRequest() {
        LocationRequest mLocationRequest = LocationRequest.create();
        mLocationRequest.setInterval(3000);
        mLocationRequest.setFastestInterval(1000);
        mLocationRequest.setSmallestDisplacement(2);
        mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
        return mLocationRequest;
    }


    private void checkLocationSetting(LocationSettingsRequest.Builder builder) {

        builder.setAlwaysShow(true);

        // Dentro de la variable 'cliente' iniciamos LocationServices, para los servicios de ubicación
        SettingsClient cliente = LocationServices.getSettingsClient(this);

        // Creamos una task o tarea para verificar la configuración de ubicación del usuario
        Task<LocationSettingsResponse> task = cliente.checkLocationSettings(builder.build());

        // Adjuntamos OnSuccessListener a la task o tarea
        task.addOnSuccessListener(this, new OnSuccessListener<LocationSettingsResponse>() {
            @Override
            public void onSuccess(LocationSettingsResponse locationSettingsResponse) {

                // Si la configuración de ubicación es correcta,
                // se puede iniciar solicitudes de ubicación del usuario
                // mediante el método iniciarActualizacionesUbicacion() que crearé más abajo.
                iniciarActualizacionesUbicacion();

            }
        });

        // Adjuntamos addOnCompleteListener a la task para gestionar si la tarea se realiza correctamente
        task.addOnCompleteListener(new OnCompleteListener<LocationSettingsResponse>() {

            @Override
            public void onComplete(Task<LocationSettingsResponse> task) {
                try {
                    LocationSettingsResponse response = task.getResult(ApiException.class);
                    // En try podemos hacer 'algo', si la configuración de ubicación es correcta,

                } catch (ApiException exception) {
                    switch (exception.getStatusCode()) {
                        case LocationSettingsStatusCodes.RESOLUTION_REQUIRED:

                            // La configuración de ubicación no está satisfecha.
                            // Le mostramos al usuario un diálogo de confirmación de uso de GPS.
                            try {
                                // Transmitimos a una excepción resoluble.
                                ResolvableApiException resolvable = (ResolvableApiException) exception;

                                // Mostramos el diálogo llamando a startResolutionForResult()
                                // y es verificado el resultado en el método onActivityResult().
                                resolvable.startResolutionForResult(
                                        Map.this,
                                        REQUEST_CHECK_SETTINGS);
                            } catch (IntentSender.SendIntentException e) {
                                // Ignora el error.
                            } catch (ClassCastException e) {
                                // Ignorar, aca podría ser un error imposible.
                            }
                            break;
                        case LocationSettingsStatusCodes.SETTINGS_CHANGE_UNAVAILABLE:
                            // La configuración de ubicación no está satisfecha
                            // podemos hacer algo.
                            break;
                    }
                }
            }
        });

    }

    public void iniciarActualizacionesUbicacion() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                // TODO: Consider calling
                //    Activity#requestPermissions
                return;
            }
        }

        // Obtenemos la ubicación más reciente
        fusedLocationClient.requestLocationUpdates(mLocationRequest,
                mlocationCallback,
                null /* Looper */);
    }

    private void dialogoSolicitarPermisoGPS(){
        if (ActivityCompat.checkSelfPermission(Map.this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED
                && ActivityCompat.checkSelfPermission(Map.this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(Map.this, new String[]{Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION}, 123);
        }
    }



}