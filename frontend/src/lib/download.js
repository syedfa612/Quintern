import api from './axios'

// Trigger a browser file download from a backend endpoint that streams a blob.
// Centralized so we never have to repeat the URL.createObjectURL dance.
export async function downloadCsv(endpoint, filename = 'export.csv') {
  const res = await api.get(endpoint, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
