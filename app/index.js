// Select your input type file and store it in a variable
const input = document.getElementById('fileinput');

// This will upload the file after having read it
const upload = (file) => {
    const fd = new FormData();
    fd.append("files", file);
    fd.append("username", "chip"); // o id del usuario
    fetch('https://noninitial-chirurgical-judah.ngrok-free.dev/api/file_manager?service=file', { // Your POST endpoint
        method: 'POST',
        headers: {
            "Accept": "*/*",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJjaGlwIiwiaWF0IjoxNzYyMTM5MTc3fQ.VDB8TeGi8nI3RG6Ie5XaI8RKrTeIJtHLeU36aoZksew",
        },
        body: fd
    }).then(
        async response => {
            let res = (await response.json())[0]
            fetch('https://noninitial-chirurgical-judah.ngrok-free.dev/api/files', { // Your POST endpoint
                method: 'POST',
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJjaGlwIiwiaWF0IjoxNzYyMTM5MTc3fQ.VDB8TeGi8nI3RG6Ie5XaI8RKrTeIJtHLeU36aoZksew",
                },
                body: JSON.stringify({
                    id_user: 1, filename: res.originalName, type: res.service, filehash: res.storedName
                })
            }).then(async response => console.log(await response.json()))
        }  // if the response is a JSON object


    ).catch(
        error => console.log(error) // Handle the error response object
    );
};

// Event handler executed when a file is selected
const onSelectFile = () => upload(input.files[0]);

// Add a listener on your input
// It will be triggered when a file will be selected
input.addEventListener('change', onSelectFile, false);