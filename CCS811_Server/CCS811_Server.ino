#include "Adafruit_CCS811.h"
#include <WiFi.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// NOTE: This requires an old version of NTPClient (3.1.0), because for some
// reason the getFormattedDate() has been removed on the newest version

Adafruit_CCS811 ccs;

#define SERVER_TCP_PORT 16000

// Enter WiFi Credentials here!
const char* ssid     = "";
const char* password = "";
WiFiServer server(SERVER_TCP_PORT);

// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP);

void setup() {
  Serial.begin(115200);

  Serial.println("CCS811 test");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.println(WiFi.localIP().toString());

  Serial.println("Starting up the TCP server...");
  server.begin();
  Serial.println("Server is up at port " + String(SERVER_TCP_PORT));
  Serial.println("nc "+WiFi.localIP().toString()+" "+String(SERVER_TCP_PORT));

  // Set offset time in seconds to adjust for your timezone, for example:
  // GMT +3 = 10800
  // GMT +1 = 3600
  // GMT +8 = 28800
  // GMT -1 = -3600
  // GMT 0 = 0
  timeClient.begin();
  timeClient.setTimeOffset(10800);

  while(!timeClient.update()) {
    timeClient.forceUpdate();
  }

  if(!ccs.begin()){
    Serial.println("Failed to start sensor! Please check your wiring.");
    while(1);
  }

  // Wait for the sensor to be ready
  while(!ccs.available());
}

void loop() {
  WiFiClient client = server.available();

  if (client) {
    if (client.connected()) {
      Serial.println("New client!");
    }
    while (client.connected()) {
      if (client.available()) {
        String msg = client.readStringUntil('\n');
        Serial.println(msg);

        int co2 = -1;
        int tvoc = -1;

        if(msg.indexOf("status") > -1) {
          if(ccs.available()){
            if(!ccs.readData()){
              co2 = ccs.geteCO2();
              tvoc = ccs.getTVOC();

              client.println(String(co2)+","+String(tvoc)+","+timeClient.getFormattedDate());
            }else{
              // Error
              client.println("Error");
            }
          }
        }

      }
    }
  }
}
