
package com.example.argeolocator.wikitude;


import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.location.Location;
import android.location.LocationListener;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import com.example.argeolocator.location.LocationProvider;
import com.example.argeolocator.R;
import com.example.argeolocator.configuration.KeyWikitude;
import com.wikitude.architect.ArchitectJavaScriptInterfaceListener;
import com.wikitude.architect.ArchitectStartupConfiguration;
import com.wikitude.architect.ArchitectView;


import org.json.JSONException;
import org.json.JSONObject;

import java.io.Console;
import java.io.IOException;
import java.util.Locale;

public class VistaWikitude extends Activity implements ArchitectJavaScriptInterfaceListener{
    ArchitectView architectView;
    KeyWikitude obj = new KeyWikitude();
    private LocationProvider locationProvider;

    TextToSpeech tts;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.vista_wikitude);

        WebView.setWebContentsDebuggingEnabled(true);


        this.architectView = this.findViewById( R.id.architectView );
        final ArchitectStartupConfiguration config = new ArchitectStartupConfiguration();
        config.setLicenseKey(obj.getKey()); // key generada por Wikitude.com
        this.architectView.onCreate(config);

        architectView.addArchitectJavaScriptInterfaceListener(this);

        /*
            *   Nota: Desde Android 6.0+, debe asegurarse de que su aplicación tenga el permiso de tiempo de ejecución
            *   de la cámara antes de llamar:
            *   architectView.onCreate( config ) Línea 24
         */

        locationProvider = new LocationProvider(this, new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (location!=null && VistaWikitude.this.architectView != null ) {
                    // check if location has altitude at certain accuracy level & call right architect method (the one with altitude information)
                    if ( location.hasAltitude() && location.hasAccuracy() && location.getAccuracy()<7) {
                        VistaWikitude.this.architectView.setLocation( location.getLatitude(), location.getLongitude(), location.getAltitude(), location.getAccuracy() );
                    } else {
                        VistaWikitude.this.architectView.setLocation( location.getLatitude(), location.getLongitude(), location.hasAccuracy() ? location.getAccuracy() : 1000 );
                    }
                }
            }

            @Override public void onStatusChanged(String s, int i, Bundle bundle) {}
            @Override public void onProviderEnabled(String s) {}
            @Override public void onProviderDisabled(String s) {}
        });

        tts = new TextToSpeech(this,onInitListener);

    }
    @Override
    public void onJSONObjectReceived(JSONObject jsonObject) {
        try {
            speak(jsonObject.getString("description"));
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }

    private void speak(String txt){

        tts.speak(txt,TextToSpeech.QUEUE_FLUSH,null);
    }

    TextToSpeech.OnInitListener onInitListener = new TextToSpeech.OnInitListener() {
        @Override
        public void onInit(int status) {
            if (status == TextToSpeech.SUCCESS){
                int result = tts.setLanguage(Locale.getDefault());

                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED){
                    Log.d("TTS", "El idioma no es soportado");
                }else{
                    Log.d("TTS", "TTS configurado correctamente");
                }
            }else{
                Log.d("TTS","Voz no inicializada");
            }
        }
    };



    @Override
    public void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
        this.architectView.onPostCreate();
        try {
            //this.architectView.load( "samples/10_BrowsingPois_3_LimitingRange.....10_BrowsingPois_4_ReloadingContent.......GEO_Webservice/index.html" ); // Ruta específica del html o URL

            this.architectView.load( "samples/10_BrowsingPois_4_ReloadingContent/index.html" ); // Ruta específica del html o URL

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        architectView.onResume(); // Llamada obligatoria del ciclo de vida de ArchitectView
        locationProvider.onResume();


    }

    @Override
    protected void onPause() {
        super.onPause();
        architectView.onPause(); // Llamada obligatoria del ciclo de vida de ArchitectView
        locationProvider.onPause();
        architectView.removeArchitectJavaScriptInterfaceListener(this);



    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        architectView.clearCache();
        architectView.onDestroy(); // Llamada obligatoria del ciclo de vida de ArchitectView
        architectView.removeArchitectJavaScriptInterfaceListener(this);
    }

}