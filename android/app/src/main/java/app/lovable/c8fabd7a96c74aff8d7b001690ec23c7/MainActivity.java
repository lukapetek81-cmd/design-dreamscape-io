package app.lovable.c8fabd7a96c74aff8d7b001690ec23c7;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(FirebaseConfigPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
