{pkgs}: {
  # nixpkgs channel.
  channel = "stable-24.05";

  packages = [
    pkgs.python312Full
 ];

  env = {};
  
  idx = {
    extensions = [
      "ms-azuretools.vscode-docker"
      "ms-python.debugpy"
      "ms-python.python"
      "GitHub.github-vscode-theme"
    ];

    previews = {
      enable = true;
      previews = {
      };
    };

    workspace = {
      onCreate = {
        default.openFiles = [ "README.md" ];
      };
      onStart = {
      };
    };
  };
}
