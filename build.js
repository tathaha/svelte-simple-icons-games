const path = require('path');
const simpleIcons = require('simple-icons');
const { pascalCase } = require('pascal-case');
const fs = require('fs-extra');

const componentTemplate = (name, svg) => `<svelte:options tag="${name}"/>
${svg.replace('<svg ', '<svg class={styleClass} ')}
<script>
  export let styleClass = ''
</script>
`;

const handleComponentName = slug => {
  if (slug === '500px') return 'five-hundred-px';
  if (/^\d/.test(slug)) return `icon-${slug}`; // Prefixes identifiers starting with a number with 'icon-'
  return slug;
};

const ensureValidTagName = name => {
  if (!name.includes('-')) {
    return `icon-${name}`;
  }
  return name;
};

const icons = Object.entries(simpleIcons).map(([name, { slug, svg }]) => {
  const handledSlug = handleComponentName(slug);
  const validTagName = ensureValidTagName(handledSlug);
  return {
    name,
    svg,
    pascalCasedComponentName: pascalCase(`${validTagName}-icon`),
    kebabCasedComponentName: `${validTagName}-icon`
  };
});

Promise.all(icons.map(icon => {
  const component = componentTemplate(icon.kebabCasedComponentName, icon.svg);
  const filepath = `./src/icons/${icon.pascalCasedComponentName}.svelte`;
  return fs.ensureDir(path.dirname(filepath))
    .then(() => fs.writeFile(filepath, component, 'utf8'));
})).then(() => {
  const main = icons
    .map(icon => `export { default as ${icon.pascalCasedComponentName} } from './icons/${icon.pascalCasedComponentName}.svelte';`)
    .join('\n\n');
  return fs.outputFile('./src/index.js', main, 'utf8');
});
