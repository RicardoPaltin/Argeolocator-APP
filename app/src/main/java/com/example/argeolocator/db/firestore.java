package com.example.argeolocator.db;

import android.util.Log;

import androidx.annotation.NonNull;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

import java.util.ArrayList;

import static android.content.ContentValues.TAG;

public class firestore {
    ArrayList<POI> puntos;



    public void obtenerData(){

        Log.d("xx", "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy ", null);

        //POI p = new();
        /*

        db.collection("poi")
                .get()
                .addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
                    @Override
                    public void onComplete(@NonNull Task<QuerySnapshot> task) {
                        if (task.isSuccessful()) {
                            for (QueryDocumentSnapshot document : task.getResult()) {
                                Log.d(TAG, document.getId() + " => " + document.getData());
                            }
                        } else {
                            Log.d(TAG, "Error getting documents: ", task.getException());
                        }
                    }
                });


         */




    }


}
