async function stubPrompt(defaultValue = 'E2E Test') {
  await browser.execute((def) => {
    window.__originalPrompt = window.prompt;
    window.prompt = (msg, d) => def || d || '';
  }, defaultValue);
}

async function stubConfirm(returnValue = true) {
  await browser.execute((val) => {
    window.__originalConfirm = window.confirm;
    window.confirm = () => val;
  }, returnValue);
}

describe('Saola Desktop App', () => {
  it('app loads and shows main UI', async () => {
    const app = await $('.app');
    await app.waitForExist({ timeout: 15000 });
    const title = await $('.app-title');
    const text = await title.getText();
    expect(text).toContain('Saola');
  });

  it('response placeholder visible before first send', async () => {
    const placeholder = await $('.response-placeholder');
    await expect(placeholder).toBeDisplayed({ timeout: 5000 });
    expect(await placeholder.getText()).toContain('Send a request');
  });

  it('collections sidebar is visible', async () => {
    const sidebar = await $('.sidebar');
    await expect(sidebar).toBeDisplayed();
    const header = await $('.sidebar-header');
    const text = await header.getText();
    expect(text.toUpperCase()).toContain('COLLECTIONS');
  });

  it('request builder is visible', async () => {
    const requestLine = await $('.request-line');
    await expect(requestLine).toBeDisplayed();
    await expect($('.method-select')).toBeDisplayed();
    await expect($('.url-input')).toBeDisplayed();
    await expect($('.send-btn')).toBeDisplayed();
  });

  describe('Collection management', () => {
    it('create collection via + New', async () => {
      await stubPrompt('E2E Test Collection');
      const newBtn = await $('.sidebar-new-btn');
      await newBtn.waitForExist({ timeout: 5000 });
      await newBtn.click();
      await browser.pause(500);
      const collections = await $$('.collection');
      expect(collections.length).toBeGreaterThanOrEqual(1);
      const names = await $$('.collection-name');
      const text = await names[0].getText();
      expect(text).toBe('E2E Test Collection');
    });

    it('save request to collection', async () => {
      const urlInput = await $('.url-input');
      await urlInput.waitForExist({ timeout: 5000 });
      await urlInput.setValue('https://httpbin.org/get');
      await browser.keys(['Control', 's']);
      await browser.pause(500);
      const saveModal = await $('.save-modal-overlay');
      await expect(saveModal).toBeDisplayed({ timeout: 3000 });
      const locationSelect = await $('.save-modal select');
      await locationSelect.waitForExist({ timeout: 2000 });
      const nameInput = await $('.save-modal input[type="text"]');
      await nameInput.setValue('Get Test Request');
      await browser.pause(200);
      const saveBtn = await $('.save-modal-actions button:last-child');
      await expect(saveBtn).not.toBeDisabled();
      await saveBtn.click();
      await browser.pause(600);
      const requests = await $$('.collection-request');
      expect(requests.length).toBeGreaterThanOrEqual(1);
      const firstReqText = await requests[0].getText();
      expect(firstReqText).toMatch(/Get|Request/i);
    });

    it('create folder in collection via context menu', async () => {
      await stubPrompt('E2E Test Folder');
      const collectionEl = await $('.collection');
      await collectionEl.waitForExist({ timeout: 5000 });
      await collectionEl.click({ button: 'right' });
      await browser.pause(400);
      const newFolderBtn = await $('button=New Folder');
      const hasContextMenu = await newFolderBtn.isExisting() && await newFolderBtn.isDisplayed();
      if (hasContextMenu) {
        await newFolderBtn.click();
        await browser.pause(500);
        const folders = await $$('.collection-folder');
        expect(folders.length).toBeGreaterThanOrEqual(1);
      }
      expect((await $$('.collection')).length).toBeGreaterThanOrEqual(1);
    });

    it('create request in collection via context menu New Request', async () => {
      const collectionEl = await $('.collection');
      await collectionEl.waitForExist({ timeout: 5000 });
      await collectionEl.click({ button: 'right' });
      await browser.pause(400);
      const newRequestBtn = await $('button=New Request');
      const hasContextMenu = await newRequestBtn.isExisting() && await newRequestBtn.isDisplayed();
      if (hasContextMenu) {
        const countBefore = (await $$('.collection-request')).length;
        await newRequestBtn.click();
        await browser.pause(500);
        const countAfter = (await $$('.collection-request')).length;
        expect(countAfter).toBeGreaterThan(countBefore);
      }
      expect((await $$('.collection-request')).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('method dropdown displays selected value', async () => {
    const methodSelect = await $('.method-select');
    await methodSelect.waitForExist({ timeout: 5000 });
    const value = await methodSelect.getValue();
    expect(value).toBeTruthy();
    expect(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).toContain(value);
    await methodSelect.selectByAttribute('value', 'POST');
    await expect(methodSelect).toHaveValue('POST');
  });

  it('send request and get response', async () => {
    const methodSelect = await $('.method-select');
    await methodSelect.selectByAttribute('value', 'GET');
    const sendBtn = await $('.send-btn');
    await sendBtn.waitForExist({ timeout: 5000 });
    await sendBtn.click();
    await browser.pause(3000);
    const statusBadge = await $('.status-badge');
    await statusBadge.waitForExist({ timeout: 5000 });
    const text = await statusBadge.getText();
    expect(text).toMatch(/2\d{2}/);
  });

  it('request tabs work', async () => {
    const tabNew = await $('.tab-new');
    await tabNew.waitForExist({ timeout: 5000 });
    await tabNew.click();
    const tabs = await $$('.request-tab');
    expect(tabs.length).toBeGreaterThanOrEqual(2);
  });

  it('create collection button is visible', async () => {
    const newBtn = await $('.sidebar-new-btn');
    await expect(newBtn).toBeDisplayed();
    const text = await newBtn.getText();
    expect(text).toMatch(/New|\+/);
  });

  it('Save modal opens on Ctrl+S when tab not linked', async () => {
    await browser.keys(['Control', 's']);
    await browser.pause(300);
    const saveModal = await $('.save-modal-overlay');
    await expect(saveModal).toBeDisplayed({ timeout: 3000 });
    const cancelBtn = await $('button=Cancel');
    await cancelBtn.click();
    await browser.pause(200);
  });

  it('settings panel opens and shows environment manager', async () => {
    const settingsBtn = await $('.settings-btn');
    await expect(settingsBtn).toBeDisplayed();
    await settingsBtn.click();
    await browser.pause(500);
    const envManager = await $('.environment-manager');
    await expect(envManager).toBeDisplayed({ timeout: 3000 });
    const storageSettings = await $('.storage-settings');
    await expect(storageSettings).toBeDisplayed();
  });

  it('settings panel can be closed', async () => {
    const settingsBtn = await $('.settings-btn');
    await settingsBtn.click();
    await browser.pause(300);
    const envManager = await $('.environment-manager');
    await expect(envManager).not.toBeDisplayed();
  });

  it('sidebar toggle collapses and expands sidebar', async () => {
    const toggle = await $('.sidebar-toggle');
    const sidebar = await $('.sidebar');
    await expect(toggle).toBeDisplayed();
    await toggle.click();
    await browser.pause(200);
    await expect(sidebar).not.toBeDisplayed();
    await toggle.click();
    await browser.pause(200);
    await expect(sidebar).toBeDisplayed();
  });

  it('global search opens with Ctrl+P', async () => {
    await browser.keys(['Control', 'p']);
    await browser.pause(300);
    const searchOverlay = await $('.global-search-overlay');
    await expect(searchOverlay).toBeDisplayed({ timeout: 3000 });
    await browser.keys('Escape');
    await browser.pause(200);
  });

  it('Params, Headers, and Body tabs work', async () => {
    const paramsTab = await $('button=Params');
    await paramsTab.waitForExist({ timeout: 5000 });
    await paramsTab.click();
    await browser.pause(200);
    const kvList = await $('.kv-list');
    await expect(kvList).toBeDisplayed();
    const addParam = await $('button=+ Add param');
    await expect(addParam).toBeDisplayed();
    const headersTab = await $('button=Headers');
    await headersTab.click();
    await browser.pause(200);
    const addHeader = await $('button=+ Add header');
    await expect(addHeader).toBeDisplayed();
    const bodyTab = await $('button=Body');
    await bodyTab.click();
    await browser.pause(200);
    const bodyEditor = await $('.body-editor, .cm-editor');
    await expect(bodyEditor).toBeDisplayed({ timeout: 2000 });
  });

  it('Save button is visible (Save as shows when tab is linked to a request)', async () => {
    const saveBtn = await $('.save-btn');
    await expect(saveBtn).toBeDisplayed();
  });

  it('can switch between request tabs', async () => {
    const tabNew = await $('.tab-new');
    if (await tabNew.isDisplayed()) await tabNew.click();
    await browser.pause(200);
    const tabs = await $$('.request-tab');
    expect(tabs.length).toBeGreaterThanOrEqual(2);
    await tabs[1].click();
    await browser.pause(200);
    const activeTab = await $('.request-tab.active');
    await expect(activeTab).toBeDisplayed();
  });

  it('can close a tab', async () => {
    const tabsBefore = await $$('.request-tab');
    if (tabsBefore.length < 2) return;
    const secondTab = await tabsBefore[1].$('.request-tab-close');
    await secondTab.click();
    await browser.pause(200);
    const tabsAfter = await $$('.request-tab');
    expect(tabsAfter.length).toBe(tabsBefore.length - 1);
  });

  it('Ctrl+Enter sends request; status badge shows 2xx success color', async () => {
    const urlInput = await $('.url-input');
    await urlInput.click();
    await urlInput.setValue('https://httpbin.org/get');
    await browser.keys(['Control', 'Enter']);
    await browser.pause(3000);
    const statusBadge = await $('.status-badge');
    await statusBadge.waitForExist({ timeout: 5000 });
    const text = await statusBadge.getText();
    expect(text).toMatch(/2\d{2}/);
    const className = await statusBadge.getAttribute('class');
    expect(className).toContain('status-2xx');
  });

  it('settings panel shows storage provider options', async () => {
    const settingsBtn = await $('.settings-btn');
    await settingsBtn.click();
    await browser.pause(500);
    const providerOptions = await $('.provider-options');
    await expect(providerOptions).toBeDisplayed({ timeout: 3000 });
    const labels = await providerOptions.getText();
    expect(labels).toMatch(/Local only|Google Drive|AWS S3/);
  });
});
