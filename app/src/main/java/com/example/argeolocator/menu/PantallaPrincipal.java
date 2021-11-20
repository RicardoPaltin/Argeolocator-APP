package com.example.argeolocator.menu;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import com.example.argeolocator.R;
import com.example.argeolocator.administation.Web_ARGeolocator;
import com.example.argeolocator.maps.Map;
import com.example.argeolocator.wikitude.VistaWikitude;

public class PantallaPrincipal extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.pantalla_principal);


        Button info = findViewById(R.id.button);
        info.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent (v.getContext(), VistaWikitude.class);
                startActivityForResult(intent, 0);
            }
        });

        Button info2 = findViewById(R.id.button3);
        info2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent (v.getContext(), Web_ARGeolocator.class);
                startActivityForResult(intent, 0);
            }
        });

        Button info3 = findViewById(R.id.button2);
        info3.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent (v.getContext(), Map.class);
                startActivityForResult(intent, 0);
            }
        });
        
    }
}