package com.example.argeolocator.maps;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.example.argeolocator.R;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import java.util.Locale;

public class ModalDialog extends BottomSheetDialogFragment {

    private BottomSheetListener mListener;

    TextView txt_descripcion;
    TextView txt_titulo;
    TextView txt_autor;
    TextView txt_fecha;
    TextView txt_tecnica;
    TextView txt_ubicacion;
    TextToSpeech tts;

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        tts = new TextToSpeech(getActivity(),onInitListener);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        tts.stop();
    }

    @SuppressLint("SetTextI18n")
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View v = inflater.inflate(R.layout.modalinformacion,container,false);
        txt_titulo = v.findViewById(R.id.txt_titulo);
        txt_descripcion = v.findViewById(R.id.txt_descripcion);
        txt_autor = v.findViewById(R.id.txt_autor);
        txt_fecha = v.findViewById(R.id.txt_fecha);
        txt_ubicacion = v.findViewById(R.id.txt_ubicacion);
        txt_tecnica = v.findViewById(R.id.txt_tecnica);



        Bundle datosRecuperados = getArguments();

        //String description = "Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen. No sólo sobrevivió 500 años, sino que tambien ingresó como texto de relleno en documentos electrónicos, quedando esencialmente igual al original. Fue popularizado en los 60s con la creación de las hojas \"Letraset\", las cuales contenian pasajes de Lorem Ipsum, y más recientemente con software de autoedición, como por ejemplo Aldus PageMaker, el cual incluye versiones de Lorem Ipsum.";
        txt_titulo.setText(datosRecuperados.getString("titulo"));
        txt_descripcion.setText(datosRecuperados.getString("descripcion"));
        txt_autor.setText("Autor: "+datosRecuperados.getString("autor"));
        txt_fecha.setText("Fecha de actualización: "+datosRecuperados.getString("fecha"));
        txt_ubicacion.setText("Ubicación: "+datosRecuperados.getString("ubicacion"));
        txt_tecnica.setText("Técnica: "+datosRecuperados.getString("tecnica"));


        String description = datosRecuperados.getString("descripcion");


        Button bEscuchar = v.findViewById(R.id.botonEscuchar);
        Button bCerrar = v.findViewById(R.id.botonCerrar);


        bEscuchar.setOnClickListener(new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                mListener.onButtonClicked("Button escuchar click");
                // long i =datosRecuperados.getLong("id");
                // int a = datosRecuperados.getInt("edad");



                speak(description);
            }
        });

        bCerrar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mListener.onButtonClicked("Button cerrar click");
                txt_descripcion.setText("pulso boton cerrar");
                tts.stop();
                dismiss();
            }
        });
        return v;
    }
    public interface BottomSheetListener{
        void onButtonClicked(String txt);

    }

    @Override
    public void onAttach(@NonNull Context context) {
        super.onAttach(context);

        try {
            mListener = (BottomSheetListener)context;

        }catch (ClassCastException e){
            throw new ClassCastException(context.toString()+"IMPLEMENT SHHETLISTENER");
        }

    }
    ///// ----- narrador ---- ///////

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
}
