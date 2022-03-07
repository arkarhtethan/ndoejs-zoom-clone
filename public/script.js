const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");

myVideo.muted = true;

const peer = new Peer(undefined, {
  host: "/",
  port: "443",
  path: "/peerjs",
});

// var conn = peer.connect("some-id");

let myVideoStream;
let text = $("input");
let messages = $(".messages");

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on("call", function (call) {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    text.keydown((e) => {
      if (e.which === 13 && text.val().length !== 0) {
        console.log("emitting");
        socket.emit("message", text.val(), ROOM_ID);
        text.val("");
      }
    });
  });
socket.on("createMessage", (message) => {
  messages.append(`<li class="message"><b>user</b><br/>${message}</li>`);
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});
socket.emit("join-room", ROOM_ID);

const connectToNewUser = (userId, stream) => {
  var call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", function (remoteStream) {
    // Show stream in some video/canvas element.
    addVideoStream(video, remoteStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
        <i class="fa-solid fa-microphone"></i>
                            <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
        <i class="unmute fa-solid fa-microphone-slash"></i>
                            <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const playStop = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
        <i class="fa-solid fa-video"></i>
                            <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
        <i class="stop fa-solid fa-video-slash"></i>
                            <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};
