'use strict'

const browser = chrome

window.addEventListener('DOMContentLoaded', () => {
  const listContainer = document.querySelector('.list')
  const totalContainer = document.querySelector('.total')

  const refreshBtn = document.querySelector('.refresh')

  const copyTxtBtn = document.querySelector('.copy-txt')
  const copyJsonBtn = document.querySelector('.copy-json')

  const saveTxtBtn = document.querySelector('.save-txt')
  const saveJsonBtn = document.querySelector('.save-json')

  async function render() {
    const tabs = await browser.tabs.query({ currentWindow: true })
    let html = ''
    for (const tab of tabs) html += renderTab(tab)

    listContainer.innerHTML = html
    totalContainer.textContent = tabs.length

    copyTxtBtn.addEventListener('click', () => copy(tabs, 'txt'))
    copyJsonBtn.addEventListener('click', () => copy(tabs, 'json'))
    saveTxtBtn.addEventListener('click', () => save(tabs, 'txt'))
    saveJsonBtn.addEventListener('click', () => save(tabs, 'json'))
    // unable to auto copy on open due to security reasons
  }

  refreshBtn.addEventListener('click', render)
  render()
})

async function copy(tabs, format) {
  await navigator.clipboard.writeText(formatData(tabs, format))
}

async function save(tabs, format) {
  const url = URL.createObjectURL(new Blob([formatData(tabs, format)]))
  const link = document.createElement('a')

  link.href = url
  link.style.display = 'none'
  link.download = `open_tabs.${format}`
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(url)
  link.remove()
}

function formatData(tabs, format) {
  switch (format) {
    case 'txt': {
      return tabs.reduce(
        (acc, it, i) => acc + `[${i + 1}] ${it.title}\n\n${it.url}\n\n---\n\n`,
        '[+] TITLE\n<URL>\n\n---\n\n'
      )
    }
    case 'json':
      return JSON.stringify(
        tabs.map(it => ({ title: it.title, url: it.url })),
        null,
        2
      )
  }
}

function renderTab(tab) {
  return `
    <div class="${tab.highlighted ? 'item selected' : 'item'}">
      <img src="${
        tab.favIconUrl ?? 'https://via.placeholder.com/20x20?text='
      }" />
      <div>
        <div class="title">${tab.index + 1}. ${tab.title}</div>
        <a class="url" href="${tab.url}" title="${tab.url}">${tab.url}</a>
      </div>
    </div>
  `
}
