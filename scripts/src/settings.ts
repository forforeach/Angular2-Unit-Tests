//settings object - currently angular does not support syntax
//of setting relative path to templateUrl
//so we will save it externally as settings const
const _buildPath = 'scripts/build';
export const _settings = {
	buildPath: _buildPath,
	componentsPath: _buildPath + '/components',
	directivesPath: _buildPath + '/directives',
	pagesPath: _buildPath + '/pages'
};