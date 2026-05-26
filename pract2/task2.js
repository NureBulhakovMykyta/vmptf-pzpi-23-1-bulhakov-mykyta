fetch('task2.json')
    .then(response => response.json())
    .then(data => {

        const table = document.getElementById('data-table');

        const headers = Object.keys(data[0]);

        let headerRow = '<tr>';

        headers.forEach(header => {
            headerRow += `<th>${header}</th>`;
        });

        headerRow += '</tr>';

        table.innerHTML = headerRow;

        data.forEach(item => {

            let row = '<tr>';

            headers.forEach(header => {
                row += `<td>${item[header]}</td>`;
            });

            row += '</tr>';

            table.innerHTML += row;
        });
    })
    .catch(error => {
        console.error(error);
    });