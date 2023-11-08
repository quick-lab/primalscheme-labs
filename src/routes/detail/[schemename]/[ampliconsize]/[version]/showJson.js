export default function showDetails(scheme) {
    console.log(scheme);

    const ol = document.createElement('ol');

    Object.keys(scheme).forEach((key) => {
        const li = document.createElement('li');
        li.innerHTML = `${key}: ${scheme[key]}`;
        ol.appendChild(li);
    });
    const container = document.getElementById('container');
    container.appendChild(ol);

};