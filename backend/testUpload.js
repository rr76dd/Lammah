async function testUpload() {
    const response = await fetch("http://localhost:5000/upload-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: "a2b2dd39-1fa5-40b8-abdf-5e8542deb6b7",
            fileName: "lecture_notes.pdf",
            fileUrl: "https://example.com/lecture_notes.pdf",
            fileType: "pdf"
        })
    });

    const data = await response.json();
    console.log(data);
}

testUpload();
