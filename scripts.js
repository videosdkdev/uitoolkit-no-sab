const urlParams = new URLSearchParams(window.location.search);
const preSetSession = urlParams.get("session");
const preSetpasscode = urlParams.get("passcode");

const sessionContainer = document.getElementById("sessionContainer");

if (preSetSession) {
  // set session in inputs
  document.getElementById("sessionName").value = preSetSession;
}

if (preSetpasscode) {
  // set passcode in inputs
  if (preSetpasscode.length > 10) {
    document.getElementById("passcodeLength").style.display = "block";
  } else {
    document.getElementById("sessionPasscode").value = preSetpasscode;
  }
}

var authEndpoint =
  "https://or116ttpz8.execute-api.us-west-1.amazonaws.com/default/videosdk";

var config = {
  videoSDKJWT: "",
  sessionName: "SessionA",
  userName: "UserA",
  sessionPasscode: "abc123",
  featuresOptions: {
    preview: {
      enable: true,
    },
    livestream: {
      enable: true,
    },
    virtualBackground: {
      enable: true,
      virtualBackgrounds: [
        {
          url: "https://images.unsplash.com/photo-1715490187538-30a365fa05bd?q=80&w=1945&auto=format&fit=crop",
        },
      ],
    },
  },
};

window.getVideoSDKJWT = getVideoSDKJWT;

function getVideoSDKJWT() {
  document.getElementById("nameRequired").style.display = "none";
  document.getElementById("sessionNameRequired").style.display = "none";
  document.getElementById("passcodeLength").style.display = "none";

  config.userName = document.getElementById("yourName").value;
  config.sessionName = document.getElementById("sessionName").value;
  config.sessionPasscode = document.getElementById("sessionPasscode").value;

  if (config.userName && config.sessionName) {
    fetch(authEndpoint, {
      method: "POST",
      body: JSON.stringify({
        sessionName: config.sessionName,
        role: parseInt(document.getElementById("role").value),
        telemetryTrackingId: `tommy-ui-toolkit-${config.sessionName}-${
          config.userName
        }-${Date.now()}`,
        video_webrtc_mode: 1,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        config.videoSDKJWT = data.signature;
        joinSession();
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    if (!config.userName) {
      document.getElementById("nameRequired").style.display = "block";
    }

    if (!config.sessionName) {
      document.getElementById("sessionNameRequired").style.display = "block";
    }
  }
}

function joinSession() {
  const newConfig = uitoolkit.migrateConfig(config);
  uitoolkit.joinSession(sessionContainer, newConfig);

  document.getElementById("header").style.display = "none";
  document.getElementById("join-flow").style.display = "none";

  uitoolkit.onSessionJoined(sessionJoined);
  uitoolkit.onSessionClosed(sessionClosed);
  uitoolkit.onSessionDestroyed(sessionDestroyed);
  uitoolkit.joinSession(sessionContainer, config);
  uitoolkit.onSessionClosed(sessionClosed);
}

var sessionTimer;
var sessionTimeout = 10 * 60 * 1000; // 10 minutes in milliseconds
var warningTime = 9 * 60 * 1000; // 9 minutes - shows warning with 1 minute remaining

var sessionJoined = () => {
  console.log("session joined");
  // Start the session timer
  sessionTimer = setTimeout(() => {
    console.log("Session timeout - leaving session");
    uitoolkit.leaveSession();
  }, sessionTimeout);

  // Set warning timer
  setTimeout(() => {
    alert("Warning: You demo session will timeout in 1 minute!");
  }, warningTime);
};

var sessionClosed = () => {
  console.log("session closed");
  if (sessionTimer) {
    clearTimeout(sessionTimer);
  }
  document.getElementById("header").style.display = "flex";
  document.getElementById("join-flow").style.display = "block";
  document.getElementById("rating").style.display = "block";
  const joinButton = document.querySelector(".join-flow button");
  joinButton.disabled = false;
  joinButton.textContent = "Join Session";
};

var sessionDestroyed = () => {
  console.log("session destroyed");
  uitoolkit.destroy();
};
