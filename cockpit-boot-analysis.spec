Name: cockpit-starter-kit
Version: 1
Release: 1%{?dist}
Summary: Cockpit Starter Kit Example Module
License: LGPL-2.1-or-later

Source0: https://github.com/cockpit-project/starter-kit/releases/download/%{version}/%{name}-%{version}.tar.xz
Source1: https://github.com/cockpit-project/starter-kit/releases/download/%{version}/%{name}-node-%{version}.tar.xz
BuildArch: noarch
%if ! 0%{?suse_version}
ExclusiveArch: %{nodejs_arches} noarch
%endif
%if ! 0%{?rhel} || 0%{?rhel} >= 10
BuildRequires: nodejs >= 18
%endif
BuildRequires: make
%if 0%{?suse_version}
# Suse's package has a different name
BuildRequires: appstream-glib
%else
BuildRequires: libappstream-glib
%endif
BuildRequires: gettext
%if 0%{?rhel} && 0%{?rhel} <= 8
BuildRequires: libappstream-glib-devel
%endif

Requires: cockpit-bridge

Provides: bundled(npm(@patternfly/patternfly)) = 5.4.0
Provides: bundled(npm(@patternfly/react-core)) = 5.4.0
Provides: bundled(npm(@patternfly/react-icons)) = 5.4.0
Provides: bundled(npm(@patternfly/react-styles)) = 5.4.0
Provides: bundled(npm(@patternfly/react-tokens)) = 5.4.0
Provides: bundled(npm(attr-accept)) = 2.2.2
Provides: bundled(npm(file-selector)) = 0.6.0
Provides: bundled(npm(focus-trap)) = 7.5.4
Provides: bundled(npm(js-tokens)) = 4.0.0
Provides: bundled(npm(loose-envify)) = 1.4.0
Provides: bundled(npm(object-assign)) = 4.1.1
Provides: bundled(npm(prop-types)) = 15.8.1
Provides: bundled(npm(react-dom)) = 18.3.1
Provides: bundled(npm(react-dropzone)) = 14.2.3
Provides: bundled(npm(react-is)) = 16.13.1
Provides: bundled(npm(react)) = 18.3.1
Provides: bundled(npm(scheduler)) = 0.23.2
Provides: bundled(npm(tabbable)) = 6.2.0
Provides: bundled(npm(tslib)) = 2.7.0

%description
Cockpit Starter Kit Example Module

%prep
%autosetup -n %{name} -a 1
# ignore pre-built bundle in release tarball and rebuild it
# but keep it in RHEL/CentOS-8/9, as that has a too old nodejs
%if ! 0%{?rhel} || 0%{?rhel} >= 10
rm -rf dist
%endif

%build
NODE_ENV=production make

%install
%make_install PREFIX=/usr

# drop source maps, they are large and just for debugging
find %{buildroot}%{_datadir}/cockpit/ -name '*.map' | xargs --no-run-if-empty rm --verbose

%check
appstream-util validate-relax --nonet %{buildroot}/%{_datadir}/metainfo/*

# this can't be meaningfully tested during package build; tests happen through
# FMF (see plans/all.fmf) during package gating

%files
%doc README.md
%license LICENSE dist/index.js.LEGAL.txt dist/index.css.LEGAL.txt
%{_datadir}/cockpit/*
%{_datadir}/metainfo/*

%changelog
