/**
 * Module dependencies
 */
import { ChangelogProcessor4Beautify } from '../../../src/r/changelog/pipelines/beautify';

describe('ChangelogProcessor4Beautify', () => {

  it('remove 0.0.0', () => {
    const input = `# [0.0.0](https://github.com/speedy/mono/compare/v0.2.3...v0.2.4) (2021-10-23)

    ## [0.2.4](https://github.com/speedy/mono/compare/v0.2.3...v0.2.4) (2021-10-23)
    
    
    ### Bug Fixes
    
    * \`--ignore-scripts\` description ([663a396](https://github.com/speedy/mono/commits/663a3963b63706d273068895f4dd79d6c70472c2))
      
      `;

    expect(ChangelogProcessor4Beautify('<cwd>', input, {})).toMatchSnapshot();
  });
  
  it('remove 1.0.0', () => {
    const input = `# [1.0.0](https://github.com/foo/bar/compare/v0.5.22...v1.0.0) (2021-11-24)



## [0.5.22](https://github.com/foo/bar/compare/v0.5.21...v0.5.22) (2021-11-24)
    
    `
    expect(ChangelogProcessor4Beautify('<cwd>', input, {})).toMatchSnapshot();
  }); 
  
  it('remove empty header', () => {
    const input = `# [](https://github.com/foo/bar/compare/v0.1.1...v) (2021-12-04)



## [0.1.1](https://github.com/foo/bar/compare/v0.1.0...v0.1.1) (2021-12-04)
    `
    expect(ChangelogProcessor4Beautify('<cwd>', input, {})).toMatchSnapshot();
  });
});
