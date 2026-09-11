{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  packages = with pkgs; [
    gettext
    gnumake
    nodejs_26
  ];

  shellHook = ''
    echo "Cockpit Boot Analysis development shell"
    echo "Run 'npm install --legacy-peer-deps' once, then 'make watch'"
  '';
}
