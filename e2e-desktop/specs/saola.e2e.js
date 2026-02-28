describe('Saola Desktop App', () => {
  it('app loads and shows main UI', async () => {
    const app = await $('.app');
    await app.waitForExist({ timeout: 10000 });
    const title = await $('.app-title');
    const text = await title.getText();
    expect(text).toContain('Saola');
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
});
