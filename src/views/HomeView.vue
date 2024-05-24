<script setup>
import { RouterLink } from 'vue-router'

const examples = [
  { name: 'Real', path: '/1/1' },
  { name: 'Complex', path: '/2/1729' },
  { name: 'Dual', path: '/2/271' },
  { name: 'Split-Complex', path: '/2/1000' },
  { name: 'Quaternion', path: '/4/87982708766312930240990603242' },
  { name: 'Cross Product 3', path: '/3/22097675691' },
  {
    name: 'Cross Product 7',
    path: '/7/9420724044472817913359231958857576279556321419551701413339452371134625317487234594575412213633129284977545312353541791088317531987737529170264353798334173189',
  },
  { name: 'Mat2x2', path: '/4/1149271402132153040968396844560' },
  {
    name: 'Mat3x3',
    path: '/9/220943276835188538518464182763329485131500743123588640769020325047669235747297191158731733067458315738178696805561721464239010470228146074640394026366821986600916842719463761090280111661779684481399542035259074900502043576434849099567818874563499625878357308231395688943124504139908346539008880952631385440101831634136012152334809738011126486145643',
  },
]

const examplesQuaternion = [
  { name: 'Quaternion', path: '/4/87982708766312930240990603242' },
  { name: 'Split-Quaternion', path: '/4/44021510534169686206832405320' },
  { name: 'Semi-Quaternion', path: '/4/60303439088322520173111469' },
  { name: 'Split-Semi-Quaternions', path: '/4/118453176091156685244622588' },
  { name: 'Quarter-Quaternions', path: '/4/2153702084870671244963200' },
]

const examplesClifford = [
  { name: 'Cl 0,0,0', path: '/1/1' },
  { name: 'Cl 1,0,0', path: '/2/1729' },
  { name: 'Cl 0,1,0', path: '/2/1000' },
  { name: 'Cl 0,0,1', path: '/2/271' },
  { name: 'Cl 2,0,0', path: '/4/87982708766312930240990603242' },
  { name: 'Cl 0,2,0', path: '/4/86470818546388723886198349640' },
  { name: 'Cl 0,0,2', path: '/4/2153702084870671244963200' },
  { name: 'Cl 1,1,0', path: '/4/44021510534169686206832405320' },
  { name: 'Cl 1,0,1', path: '/4/60303439088322520173111469' },
  { name: 'Cl 0,1,1', path: '/4/118453176091156685244622588' },
]

const examplesCayleyDickson = [
  { name: 'Real', path: '/1/1' },
  { name: 'Complex', path: '/2/1729' },
  { name: 'Quaternion', path: '/4/87982708766312930240990603242' },
  {
    name: 'Octonion',
    path: '/8/5891715180497561895294426187604915465679729907063475179880057886686441289330242815996410245927582231635984768464103467903481121496515000823044479921286860560293034329374522620778126655185035612064543002128210274450282103486832419981427522164',
  },
]

const examplesNPlex = [
  { name: 'Duplex', path: '/2/1000' },
  { name: 'Triplex', path: '/3/861254944615' },
  { name: 'Quadplex', path: '/4/383099085122419850349879494560' },
  { name: 'Quintuplex', path: '/5/48585925499306606622667284864728602017927418555776905833309' },
]

const examplesOther = [
  { name: 'Trivial', path: '/1/0' },
  { name: 'Left Units 2', path: '/2/2296' },
  { name: 'Right Units 2', path: '/2/2440' },
  { name: 'Left Units 3', path: '/3/2573765069239' },
  { name: 'Right Units 3', path: '/3/2639540492407' },
  { name: 'Nil Index 3 (AntiAssociative and Associative)', path: '/2/3' },
  { name: 'Nil Index 4 (AntiAssociative and not Associative)', path: '/3/177636' },
  { name: 'Real + Real', path: '/2/2188' },
  { name: 'Real + Real + Real', path: '/3/2541867422653' },
  { name: 'Real + Complex', path: '/3/1788851132200' },
  { name: 'Complex + Complex', path: '/4/777171261743863745858182964890' },
  //{ name: 'Complex * Complex', path: '/4/45649703178359918184201282586' },
  { name: 'BiComplex (Complex * Complex)', path: '/4/45649703178359918184201282586' },
  { name: 'Dual Complex (Dual * Complex)', path: '/4/118453172038807426844525371' },
  { name: 'Split-BiComplex (SplitComplex * Complex)', path: '/4/86470815588023668076964553780' },
  {
    name: 'BiQuaternion (Complex * Quaternion)',
    path: '/8/2946531545032225811010031244987197232342080949608660313362484061285521127072508038872506200507949779580791598072032003661916627592329262264242084136479026549915506784055190653570285895575438873219165780411973576294171377013781328916007537204',
  },
  {
    name: 'Dual Quaternion (Dual * Quaternion)',
    path: '/8/257599978385392468001064158593892495075190408594560585196521173421839444647286362078458382597517334592922777112523252996427277530175759491750827025570966003784268137464134397073220536171522966655741652130661096219994054069239646',
  },
  {
    name: 'Split-BiQuaternion (SplitComplex * Quaternion)',
    path: '/8/5893061241925320695001928561507642802390672682211553513937566970147015334938400885324277963279406443208380546574790670534091282732479203064064047428315199296310785645975985029294480201616478839896722678826573059316242312654057808879942436968',
  },
]
</script>

<template>
  <main>
    <section>
      <h2>Examples</h2>
    </section>
    <section>
      <h3>Common</h3>
      <ul>
        <li v-for="example in examples" :key="example.path">
          <RouterLink :to="example.path">{{ example.name }}</RouterLink>
        </li>
      </ul>
    </section>
    <section>
      <h3>Cayley Dickson Construction</h3>
      <ul>
        <li v-for="example in examplesCayleyDickson" :key="example.path">
          <RouterLink :to="example.path">{{ example.name }}</RouterLink>
        </li>
      </ul>
    </section>
    <section>
      <h3>Clifford Algebras</h3>
      <ul>
        <li v-for="example in examplesClifford" :key="example.path">
          <RouterLink :to="example.path">{{ example.name }}</RouterLink>
        </li>
      </ul>
    </section>
    <section>
      <h3>Quaternions</h3>
      <ul>
        <li v-for="example in examplesQuaternion" :key="example.path">
          <RouterLink :to="example.path">{{ example.name }}</RouterLink>
        </li>
      </ul>
    </section>
    <section>
      <h3>n-Plex Numbers</h3>
      <ul>
        <li v-for="example in examplesNPlex" :key="example.path">
          <RouterLink :to="example.path">{{ example.name }}</RouterLink>
        </li>
      </ul>
    </section>
    <section>
      <h3>Other</h3>
      <ul>
        <li v-for="example in examplesOther" :key="example.path">
          <RouterLink :to="example.path">{{ example.name }}</RouterLink>
        </li>
      </ul>
    </section>
  </main>
</template>
