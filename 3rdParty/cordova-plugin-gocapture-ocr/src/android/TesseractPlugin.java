package com.leadliaison.mobilitease.ocr;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.DataInputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.zip.GZIPInputStream;

import org.json.JSONObject;
import org.json.JSONArray;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import com.googlecode.tesseract.android.TessBaseAPI;
import com.googlecode.tesseract.android.ResultIterator;
import com.googlecode.tesseract.android.TessBaseAPI.PageIteratorLevel;

import android.app.Activity;
import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.ColorMatrix;
import android.media.ExifInterface;
import android.os.AsyncTask;
import android.os.Environment;
import android.util.Base64;
import android.util.Log;
import android.net.Uri;

import android.content.Context;

public class TesseractPlugin extends CordovaPlugin {
    public static final String DATA_PATH = Environment.getExternalStorageDirectory().toString() + "/OCRFolder/";
    private static final String TAG = "TesseractPlugin";
    private String lang = "por";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        try {
            String language = args.getString(0);

            String result = null;
            Log.v(TAG, "Action: " + action);
            if (action.equals("recognizeText")) {
                String imageData = args.getString(1);
                result = recognizeText(imageData, language);
            } else if(action.equals("recognizeWords")) {
				String imageData = args.getString(1);
                result = recognizeWords(imageData, language);
			} else if(action.equals("recognizeWordsFromPath")) {
				String imageData = args.getString(1);
                result = recognizeWordsFromPath(imageData, language);
			}else {
                result = loadLanguage(language);
            }

            Log.v(TAG, "Result: " + result);
            this.echo(result, callbackContext);
            return true;
        } catch (Exception e) {
            Log.v(TAG, "Exception in Execute:" + e.getMessage());
            callbackContext.error(e.getMessage());
            return false;
        }
    }


    private void echo(String result, CallbackContext callbackContext) {
        if (result != null && result.length() > 0) {
            callbackContext.success(result);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }

    public String recognizeText(String imageData, String language) {
        Log.v(TAG, "Starting process to recognize text in photo.");

        byte[] decodedString = Base64.decode(imageData, Base64.DEFAULT);
        Bitmap bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);

        Log.v(TAG, "Before baseApi");

        TessBaseAPI baseApi = new TessBaseAPI();
        baseApi.setDebug(true);
        baseApi.init(DATA_PATH, language);
        baseApi.setImage(bitmap);

        String recognizedText = "";
        recognizedText = baseApi.getUTF8Text();

        baseApi.end();

        // You now have the text in recognizedText var, you can do anything with it.
        Log.v(TAG, "Recognized Text: " + recognizedText);
        return recognizedText;
    }

	public String recognizeWordsFromPath(String imagePath, String language) throws JSONException, IOException{
        Log.v(TAG, "Starting process to recognize text in photo.");
		Log.v(TAG, imagePath);
		File file = new File(Uri.parse(imagePath).getPath());
		Log.v(TAG, Uri.parse(imagePath).getPath());
		if(!file.exists()){
			return "{}";
		}

		byte[] bytes = new byte[(int) file.length()];
		BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
		DataInputStream dis = new DataInputStream(bis);
		dis.readFully(bytes);

        Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);

		Bitmap bmpGrayscale = Bitmap.createBitmap(bitmap.getWidth(), bitmap.getHeight(), bitmap.getConfig());
        Canvas c = new Canvas(bmpGrayscale);
        Paint paint = new Paint();
        ColorMatrix cm = new ColorMatrix();
        cm.setSaturation(0);
        ColorMatrixColorFilter f = new ColorMatrixColorFilter(cm);
        paint.setColorFilter(f);
        c.drawBitmap(bitmap, 0, 0, paint);

        Log.v(TAG, "Before baseApi");

        TessBaseAPI baseApi = new TessBaseAPI();
        baseApi.setDebug(true);
        baseApi.init(DATA_PATH, language);
        baseApi.setImage(bmpGrayscale);

        String recognizedText = "";
        recognizedText = baseApi.getUTF8Text();

		JSONObject obj = new JSONObject();
		obj.put("recognizedText", recognizedText);
		JSONArray words = new JSONArray();
		obj = obj.put("words", words);

		ResultIterator iterator = baseApi.getResultIterator();
		iterator.begin();
        do {
			Rect r = iterator.getBoundingRect(PageIteratorLevel.RIL_WORD);
			words.put(
				new JSONObject()
					.put("word", iterator.getUTF8Text(PageIteratorLevel.RIL_WORD))
					.put("box", r.left + " " + r.top + " " + r.width() + " " + r.height())
					.put("confidence", iterator.confidence(PageIteratorLevel.RIL_WORD))
			);
        } while (iterator.next(PageIteratorLevel.RIL_WORD));
        baseApi.end();
		iterator = null;
        // You now have the text in recognizedText var, you can do anything with it.
        Log.v(TAG, "Recognized Text: " + recognizedText);
        return obj.toString();
    }

	public String recognizeWords(String imageData, String language) throws JSONException{
        Log.v(TAG, "Starting process to recognize text in photo.");

        byte[] decodedString = Base64.decode(imageData, Base64.DEFAULT);
        Bitmap bitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);

        Log.v(TAG, "Before baseApi");

        TessBaseAPI baseApi = new TessBaseAPI();
        baseApi.setDebug(true);
        baseApi.init(DATA_PATH, language);
        baseApi.setImage(bitmap);

        String recognizedText = "";
        recognizedText = baseApi.getUTF8Text();

		JSONObject obj = new JSONObject();
		obj.put("recognizedText", recognizedText);
		JSONArray words = new JSONArray();
		obj = obj.put("words", words);

		ResultIterator iterator = baseApi.getResultIterator();
		iterator.begin();
        do {
			Rect r = iterator.getBoundingRect(PageIteratorLevel.RIL_WORD);
			words.put(
				new JSONObject()
					.put("word", iterator.getUTF8Text(PageIteratorLevel.RIL_WORD))
					.put("box", r.left + " " + r.top + " " + r.width() + " " + r.height())
					.put("confidence", iterator.confidence(PageIteratorLevel.RIL_WORD))
			);
        } while (iterator.next(PageIteratorLevel.RIL_WORD));
        baseApi.end();
		iterator = null;
        // You now have the text in recognizedText var, you can do anything with it.
        Log.v(TAG, "Recognized Text: " + recognizedText);
        return obj.toString();
    }

    public String loadLanguage(String language) {
        Log.v(TAG, "Starting process to load OCR language file.");
        String[] paths = new String[] { DATA_PATH, DATA_PATH + "tessdata/" };
        for (String path : paths) {
            File dir = new File(path);
            if (!dir.exists()) {
                if (!dir.mkdirs()) {
                    Log.v(TAG, "Error: Creation of directory " + path + " on sdcard failed");
                    return "Error: Creation of directory " + path + " on sdcard failed";
                } else {
                    Log.v(TAG, "Directory created " + path + " on sdcard");
                }
            }
        }

        if (language != null && language != "") {
            lang = language;
        }

        if (!(new File(DATA_PATH + "tessdata/" + lang + ".traineddata")).exists()) {
            DownloadAndCopy job = new DownloadAndCopy();
            job.execute(lang);
        }
        return "Ok";
    }


    private class DownloadAndCopy extends AsyncTask<String, Void, String> {

        @Override
        protected String doInBackground(String[] params) {
            // do above Server call here
            try {
                Log.v(TAG, "Downloading " + lang + ".traineddata");
                URL url = new URL("https://cdn.rawgit.com/naptha/tessdata/gh-pages/3.02/"+lang+".traineddata.gz");
                GZIPInputStream gzip = new GZIPInputStream(url.openStream());
                Log.v(TAG, "Downloaded and unziped " + lang + ".traineddata");

                OutputStream out = new FileOutputStream(DATA_PATH
                        + "tessdata/" + lang + ".traineddata");

                byte[] buf = new byte[1024];
                int len;
                while ((len = gzip.read(buf)) > 0) {
                    out.write(buf, 0, len);
                }

                gzip.close();
                out.close();

                Log.v(TAG, "Copied " + lang + ".traineddata");
            } catch (IOException e) {
                Log.e(TAG, "Unable to copy " + lang + ".traineddata " + e.toString());
            }

            return "Copied " + lang + ".traineddata";
        }

        @Override
        protected void onPostExecute(String message) {
            //process message
            Log.v(TAG, "Download and copy done! Nothing else to do.");
        }
    }
}