package com.example.argeolocator.wikitude;

import com.wikitude.architect.ArchitectView;

import android.app.Activity;

public class ArchitectViewExtension {

    protected final Activity activity;
    protected final ArchitectView architectView;

    public ArchitectViewExtension(Activity activity, ArchitectView architectView) {
        this.activity = activity;
        this.architectView = architectView;
    }

    public void onCreate(){}

    public void onPostCreate(){}

    public void onResume(){}

    public void onPause(){}

    public void onDestroy(){}
}
