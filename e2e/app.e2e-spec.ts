import { IntelliSensePage } from './app.po';

describe('intelli-sense App', function() {
  let page: IntelliSensePage;

  beforeEach(() => {
    page = new IntelliSensePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
