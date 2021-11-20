package com.example.argeolocator.administation;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Bundle;

import com.example.argeolocator.R;
import androidx.appcompat.app.AppCompatActivity;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.ProgressBar;
import android.widget.Toast;

public class Web_ARGeolocator extends AppCompatActivity {

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.web_argeolocator);

        WebView mWebView = (WebView) findViewById(R.id.webView);
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setGeolocationEnabled(true);
        webSettings.setAppCacheEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setDomStorageEnabled(true);

        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        mWebView.setWebChromeClient(new WebChromeClient() {
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });

        mWebView.loadUrl("https://argelocationweb.herokuapp.com/");

        //mWebView.loadUrl("http://192.168.1.111/ARGEOLOCATOR_WEB_v1/index_gestion.html");
        //mWebView.loadUrl("http://192.168.1.105/geo1/geo.html")
        //mWebView.loadUrl("https://developers.google.com/maps/documentation/javascript/examples/map-geolocation#run-locally");

    }

}